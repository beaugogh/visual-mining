package subcombo;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import weka.core.Instances;

public class Vertical {

	Parser parser;
	Map<Integer, List<String>> map;
	Instances data;
	int valIndex;
	List<Comparison> comparisons;
	
	public Vertical(Parser parser) {
		this.parser = parser;
		this.data = parser.data();
		this.valIndex = parser.valIndex();
		this.map = parser.attribute_map();
		this.comparisons = new ArrayList<Comparison>();
	}
	
	public void run() {
		
		for(int attr_index: map.keySet()) {
			List<String> attr_vals = map.get(attr_index);
			for(String attr_val: attr_vals) {
				Combination combo = new Combination(attr_index, attr_val);
				combo.label().put(attr_index, attr_val);
				List<String> complement = attrValComplement(attr_index, attr_val);
				Combination ccombo = new Combination();
				ccombo.label().put(attr_index, "NOT "+attr_val);
				ccombo.combo().put(attr_index, complement);
				Comparison comparison = new Comparison(data, valIndex);
				comparison.compare(combo, ccombo);
				if(comparison.getP()>0) comparisons.add(comparison);
				
				compareVertically(combo);
			}//for each attribute value with this name
		}//for each attribute name
	}//run
	
	private List<String> attrValComplement(int attr_index, String attr_val) {
		List<String> complement_vals = new ArrayList<String>();
		List<String> attr_vals = map.get(attr_index);
		for(String val: attr_vals) {
			if(!val.equals(attr_val)) complement_vals.add(val);
		}
		return complement_vals;
	}

	private List<Integer> attrComplement(Combination G) {
		List<Integer> complement = new ArrayList<Integer>();
		for(int attr_index: map.keySet()) {
			if(attr_index > G.maxIndex()) complement.add(attr_index);
		}
		return complement; 
	}
	
	private void compareVertically(Combination G) { 
		List<Integer> complement = attrComplement(G);
		for(int attr_index: complement) {
			List<String> attr_vals = map.get(attr_index);
			for(String attr_val: attr_vals) {
				Combination G1 = G.copy();
				List<String> l = new ArrayList<String>();
				l.add(attr_val);
				G1.combo().put(attr_index, l);
				G1.label().put(attr_index, attr_val);
				
				List<String> complementVals = attrValComplement(attr_index, attr_val);
				Combination cG1 = G.copy();
				cG1.label().put(attr_index, "NOT "+attr_val);
				cG1.combo().put(attr_index, complementVals);
				
				Comparison comparison = new Comparison(data, valIndex);
				comparison.compare(G1, cG1);
				if(comparison.getP()>0) comparisons.add(comparison);
				
				compareVertically(G1);
			}//for
		}//for
	}

	public void output() {
		try {
			BufferedWriter w = new BufferedWriter(
					new OutputStreamWriter(new FileOutputStream("output/v_output.txt"),"UTF-8"));
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
