package hicomm;

import java.io.*;
import java.net.URISyntaxException;
import java.util.*;

import processing.data.JSONArray;
import processing.data.JSONObject;
import ch.epfl.lis.jmod.Jmod;
import ch.epfl.lis.jmod.JmodNetwork;
import ch.epfl.lis.jmod.JmodSettings;
import ch.epfl.lis.jmod.modularity.community.Community;
import ch.epfl.lis.networks.*;

public class Main {
	public static void main(String[] args) {
		new Main("data/"+args[0]);//e.g.lesmis.tsv
	}
	
	List<Node> singles;
	JSONObject json;
	
	public Main(String dir) {
		json = new JSONObject();
		try { 
			singles = new ArrayList<Node>();
			NodeFactory<Node> nodeFactory = new NodeFactory<Node>(new Node());
			EdgeFactory<Edge<Node>> edgeFactory = new EdgeFactory<Edge<Node>>(new Edge<Node>());
			Structure<Node, Edge<Node>> structure = new Structure<Node, Edge<Node>>(nodeFactory, edgeFactory);
			
			BufferedReader r = new BufferedReader(new FileReader(dir));
			String line = r.readLine();
			while(line != null) {
				String[] st = line.split("\t");
				String s = st[0];
				String t = st[1];
				if(!s.equals(t)) {
					Node source = new Node(s);
					Node target = new Node(t);
					Edge<Node> edge = new Edge<Node>(source,target);
					structure.addNode(source);
					structure.addNode(target);
					structure.addEdge(edge);
				}
				else{
					Node node = new Node(s);
					singles.add(node);
				}
				line = r.readLine();
			}
			r.close();
			
			String[] ss = dir.split("/"); 
			String filename = ss[ss.length-1];
			String network_name = filename.substring(0, filename.length()-4);
			json.setString("name", network_name);
			JSONArray children = new JSONArray();
			structure.setName(network_name); 
			JmodNetwork network = new JmodNetwork(structure);
			JmodSettings settings = JmodSettings.getInstance();
			settings.setUseMovingVertex(true);
			settings.setUseGlobalMovingVertex(true);
			
			// run modularity detection
			Jmod jmod = new Jmod();
			jmod.runModularityDetection(network);
			jmod.printResult();
			List<Community> comms = jmod.getRootCommunity().getIndivisibleCommunities();
			for(Community comm: comms) {  
				int nodeindex = (int) comm.getVertexIndexes().get(0);
				int comm_index = network.getNode(nodeindex).getCommunityIndex();
				String comm_name = "comm";
				computeComms(children, network, comm, comm_name, comm_index);
			}
			
			// singles
			JSONObject singles_node = new JSONObject();
			singles_node.setString("name", "comm_"+(comms.size()+1));
			JSONArray singles_children = new JSONArray();
			for(Node n: singles) {
				JSONObject member = new JSONObject();
				member.setString("name", n.getName());
				singles_children.append(member);
			}
			singles_node.setJSONArray("children", singles_children);
			children.append(singles_node);
			json.setJSONArray("children", children);
			json.write(new PrintWriter(new File("output/"+network_name+".json")));
			
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (URISyntaxException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}//constructor
	
	static void println(Object o) {
		System.out.println(o);
	}
	
	
	private void computeComms(JSONArray children, JmodNetwork network, Community comm, 
			String parent_name, int comm_index) throws Exception { 
		NodeFactory<Node> nodeFactory = new NodeFactory<Node>(new Node());
		EdgeFactory<Edge<Node>> edgeFactory = new EdgeFactory<Edge<Node>>(new Edge<Node>());
		Structure<Node, Edge<Node>> structure = new Structure<Node, Edge<Node>>(nodeFactory, edgeFactory);
		
		Map<String, Edge<Node>> edges = network.getEdges();
		for(String key: edges.keySet()) {
			Edge<Node> edge = edges.get(key);
			Node source = edge.getSource();
			Node target = edge.getTarget();
			if(source.getCommunityIndex() == target.getCommunityIndex()) {
				if(source.getCommunityIndex() == comm_index) {
					structure.addNode(source); structure.addNode(target);
					structure.addEdge(edge);
				}
			}
		}
		
		JmodNetwork sub_network = new JmodNetwork(structure);
		println("sub: "+sub_network.getNodes().size()+", "+sub_network.getEdges().size());
		JmodSettings settings = JmodSettings.getInstance();
		settings.setUseMovingVertex(true);
		settings.setUseGlobalMovingVertex(true);
		
		// run modularity detection
		JSONObject obj = new JSONObject();
		String comm_name = parent_name + "_"+(comm_index);
		obj.setString("name", comm_name);
		JSONArray obj_children = new JSONArray();
		Jmod jmod = new Jmod();
		jmod.runModularityDetection(sub_network);
		jmod.printResult();
		List<Community> sub_comms = jmod.getRootCommunity().getIndivisibleCommunities();
		println("sub: "+sub_comms.size());
		if(sub_comms.size() == 1) {
			int n = comm.getCommunitySize();
			for(int i=0; i<n; i++) {
				int nodeindx = (int)comm.getVertexIndexes().get(i);
				String mname = network.getNode(nodeindx).getName();
				JSONObject member = new JSONObject();
				member.setString("name", mname);
				obj_children.append(member);
			}
		}
		else{
			for(Community sub_comm: sub_comms) {
				int nodeindex = (int) sub_comm.getVertexIndexes().get(0);
				int sub_comm_index = sub_network.getNode(nodeindex).getCommunityIndex();
				computeComms(obj_children, sub_network, sub_comm, comm_name, sub_comm_index);
			}
		}
		
		obj.setJSONArray("children", obj_children);
		children.append(obj);
	}//computeComms
}
