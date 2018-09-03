package subcombo;

import java.io.BufferedReader;
import java.io.FileReader;

public class Main {

	public static void main(String[] args) {
		String dir = "data/example.arff";
		int valIndex = 6;
		String which = "v";
		
		try {
			BufferedReader r = new BufferedReader(new FileReader("data/params.txt"));
			String l = r.readLine();
			while(l != null) {
				String[] ss = l.split(":");
				if(ss[0].equals("data_directory")) dir=ss[1];
				else if(ss[0].equals("value_index")) valIndex=Integer.valueOf(ss[1]);
				else if(ss[0].equals("which_algo")) which=ss[1];
				else if(ss[0].equals("alpha")) Comparison.ALPHA=Double.valueOf(ss[1]);
				else if(ss[0].equals("min_num_instances")) Comparison.MIN_NUM_INSTANCES=Integer.valueOf(ss[1]);
				l = r.readLine();
			}
			r.close();
		} catch (Exception e) {
			println("IO Exception, use default parameters instead...");
			dir = "data/example.arff";
			valIndex = 6;
			which = "v";
		}
		
		Parser parser = new Parser(dir,valIndex);
		/*
		 * vertical comparisons
		 */
		if(which.equals("v")) {
			Vertical v = new Vertical(parser);
			v.run();
			v.output();
		}
		/*
		 * horizontal comparisons
		 */
		else if(which.equals("h")) {
			Horizontal h = new Horizontal(parser);
			h.run();
			h.output();
		}
		
	}
	
	static void println(Object obj) {
		System.out.println(obj);
	}
}
