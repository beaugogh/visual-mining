package subcombo;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

import weka.core.*;

public class Parser {

	Map<Integer,List<String>> attribute_map;
	Instances data;
	int valIndex;
	
	public static void main(String[] args) {
		new Parser("data/example.arff", 6);
	}
	
	public Parser(String dir, int valIndex) {
		this.valIndex = valIndex;
		attribute_map = new HashMap<Integer,List<String>>();
		try {
			BufferedReader r = new BufferedReader(new FileReader(dir));
			data = new Instances(r);
			for(int i=0; i<data.numAttributes(); i++) {
				
				if(data.attribute(i).isNominal()) {
					List<String> attr_vals = new ArrayList<String>();
					@SuppressWarnings("rawtypes")
					Enumeration e = data.attribute(i).enumerateValues();
					while(e.hasMoreElements()) {
						attr_vals.add((String)e.nextElement());
					}
					attribute_map.put(i, attr_vals);
				}//if nominal
			}
			r.close();
			
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public Map<Integer,List<String>> attribute_map() {
		return this.attribute_map;
	}
	
	public Instances data() { 
		return data;
	}
	
	public int valIndex() {
		return valIndex;
	}
	
	static void println(Object obj) {
		System.out.println(obj);
	}
}
