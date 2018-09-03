package subcombo;

import java.util.*;

import weka.core.Instance;

public class Combination {

	Map<Integer, String> label;//<attribute index, attribute value>
	Map<Integer, List<String>> combo;
	
	public Combination() { 
		label = new HashMap<Integer,String>();
		combo = new HashMap<Integer, List<String>>();
	}
	
	public Combination(int attr_index, String attr_val) {
		label = new HashMap<Integer,String>();
		combo = new HashMap<Integer, List<String>>();
		List<String> l = new ArrayList<String>();
		l.add(attr_val);
		combo.put(attr_index, l);
	}

	public Map<Integer,String> label() { return label; }
	
	public Map<Integer, List<String>> combo() { return combo; }
	
	public int maxIndex() {
		int index = 0;
		for(int i: combo.keySet()) {
			if(i>index) index = i;
		}
		return index;
	}
	
	public boolean isMatching(Instance inst) {
		for(int attr_index: combo.keySet()) {
			List<String> attr_vals = combo.get(attr_index);
			String val = inst.stringValue(attr_index);
			// OR logic
			boolean m = false;
			if(attr_vals.contains(val)) m = true;
			// AND logic
			if(!m) return false;			
		}
		
		return true;
	}
	
	public Combination copy() {
		Combination c = new Combination();
		for(int i: label.keySet()){
			c.label().put(i, label.get(i));
		}
		for(int i: combo.keySet()) {
			List<String> l = new ArrayList<String>();
			for(String s: combo.get(i)) l.add(s);
			c.combo().put(i, l);
		}
		return c;
	}	
	
	public String toString() {
		StringBuffer ss = new StringBuffer();
		ss.append("(");
		for(int i: label.keySet()) {
			ss.append(label.get(i));
			ss.append(", ");
		}
		ss.delete(ss.length()-2, ss.length());
		ss.append(")");
		return ss.toString();
	}
	
}
