package subcombo;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import weka.core.Instances;


public class Horizontal {

	Parser parser;
	Map<Integer, List<String>> map;
	Instances data;
	int valIndex;
	List<Comparison> comparisons;
	
	public Horizontal(Parser parser) {
		this.parser = parser;
		this.data = parser.data();
		this.valIndex = parser.valIndex();
		this.map = parser.attribute_map();
		this.comparisons = new ArrayList<Comparison>();
	}
	
	public void run() {
		for(int attr_index: map.keySet()) {
			List<Combination> combos = new ArrayList<Combination>();
			List<String> attr_vals = map.get(attr_index);
			for(String attr_val: attr_vals) {
				Combination combo = new Combination(attr_index, attr_val);
				combo.label().put(attr_index, attr_val);
				combos.add(combo); 
				
				compareHorizontally(combo);
			}//for each attribute value with this name
			
			Comparison comparison = new Comparison(data, valIndex);
			if(combos.size() > 2) {
				comparison.compare(combos);
				if(comparison.getP()>0 && comparison.children() != null)
					comparisons.addAll(comparison.children());
			}
			else if(combos.size() == 2) {
				comparison.compare(combos.get(0), combos.get(1));
				if(comparison.getP()>0) comparisons.add(comparison);
			}
		}//for each attribute name
	}//run
	
	
	private void compareHorizontally(Combination G) { 
		List<Integer> complement = attrComplement(G);
		for(int attr_index: complement) {
			List<Combination> combos = new ArrayList<Combination>();
			List<String> attr_vals = map.get(attr_index);
			for(String attr_val: attr_vals) {
				Combination G1 = G.copy();
				List<String> l = new ArrayList<String>();
				l.add(attr_val);
				G1.combo.put(attr_index, l);
				G1.label().put(attr_index, attr_val);
				combos.add(G1); 
				
				compareHorizontally(G1);
			}//for
			
			Comparison comparison = new Comparison(data, valIndex);
			if(combos.size() > 2) {
				comparison.compare(combos);
				if(comparison.getP()>0 && comparison.children() != null)
					comparisons.addAll(comparison.children());
			}
			else if(combos.size() == 2) {
				comparison.compare(combos.get(0), combos.get(1));
				if(comparison.getP()>0) comparisons.add(comparison);
			}
		}//for 
	}

	private List<Integer> attrComplement(Combination G) {
		List<Integer> complement = new ArrayList<Integer>();
		for(int attr_index: map.keySet()) {
			if(attr_index > G.maxIndex()) complement.add(attr_index);
		}
		return complement; 
	}
	
	public void output() {
		try {
			BufferedWriter w = new BufferedWriter(
					new OutputStreamWriter(new FileOutputStream("output/h_output.txt"),"UTF-8"));
			println("------------------------RESULTS BEGIN------------------------");
			for(Comparison c: comparisons) {
				if(c.getP() < Comparison.ALPHA) {
					String line = c.toString();
					System.out.println(line);
					w.write(line+"\n");
				}
			}
			println("------------------------RESULTS END------------------------");
			w.close();
		} catch (Exception e) {
			e.printStackTrace();
		} 
	}
	
	static void println(Object obj) {
		System.out.println(obj);
	}
}
