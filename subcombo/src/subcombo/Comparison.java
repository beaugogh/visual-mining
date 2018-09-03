package subcombo;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

import jsc.datastructures.GroupedData;
import jsc.independentsamples.KruskalWallisTest;
import jsc.independentsamples.MannWhitneyTest;
import jsc.tests.H1;
import weka.core.Instance;
import weka.core.Instances;

public class Comparison {

	static double ALPHA = 0.05d;
	static int MIN_NUM_INSTANCES = 30;
	static boolean DEBUGGING = true;
	
	Instances data;
	int valIndex;//the index of the numeric attribute subject to comparison
	Combination combo_a, combo_b;
	List<Double> aVals, bVals;
	List<Comparison> children;//only used in pairwise testing after Kruskal-Wallis Test
	
	String sign;//combo_a > combo_b,combo_a < combo_b or combo_a = combo_b
	double p=-1;//two-tailed
	DecimalFormat decimalFormat;
	
	
	public Comparison(Instances data, int valIndex) {
		this.data = data;
		this.valIndex = valIndex;
		aVals = new ArrayList<Double>(); 
		bVals = new ArrayList<Double>(); 
		decimalFormat = new DecimalFormat("#.####");
	}
	
	public void compare(Combination a, Combination b) {
		if(DEBUGGING) {
			System.out.println("compare "+a.toString()+" AND "+b.toString());
		}
		this.combo_a = a; this.combo_b = b;
		for(int i=0; i<data.numInstances(); i++) {
			Instance inst = data.instance(i);
			if(a.isMatching(inst)) aVals.add(inst.value(valIndex));
			if(b.isMatching(inst)) bVals.add(inst.value(valIndex));
		}//for
		
		if(aVals.size()>=MIN_NUM_INSTANCES && bVals.size()>=MIN_NUM_INSTANCES) {
			double[] avals = new double[aVals.size()];
			for(int i=0; i<aVals.size(); i++) avals[i] = aVals.get(i);
			double[] bvals = new double[bVals.size()];
			for(int i=0; i<bVals.size(); i++) bvals[i] = bVals.get(i);

			MannWhitneyTest test = new MannWhitneyTest(avals,bvals,H1.NOT_EQUAL);		
			double normSumA = test.getRankSumA()/(double)avals.length;
			double normSumB = test.getRankSumB()/(double)bvals.length;
			if(normSumA > normSumB) sign = ">";
			else if(normSumA < normSumB) sign = "<";
			else sign = "="; 
			
			p = test.getSP();
		}
		
	}//compare two combos
	
	public void compare(List<Combination> combos) {
		/*
		 * assumption: all combos are different from each other
		 */
		if(combos.size() > 2) {
			List<String> combo_labels = new ArrayList<String>();
			for(int i=0; i<combos.size(); i++) {
				combo_labels.add(Integer.toString(i));
			}
			List<Double> vals = new ArrayList<Double>();
			List<String> labels = new ArrayList<String>();
			for(int i=0; i<data.numInstances(); i++) { 
				Instance inst = data.instance(i); 
				for(int j=0; j<combos.size(); j++) {
					Combination c = combos.get(j);
					if(c.isMatching(inst)) {
						vals.add( inst.value(valIndex) );
						labels.add( combo_labels.get(j) ); 
						break;
					}
				}//for j, combo
			}//for i, instance
			
			double[] _vals = new double[vals.size()];
			String[] _labels = new String[labels.size()];
			for(int i=0; i<_vals.length; i++) {
				_vals[i] = vals.get(i);
				_labels[i] = labels.get(i);
			}
			try{
				GroupedData gd = new GroupedData(_vals, _labels);
				KruskalWallisTest test = new KruskalWallisTest(gd);
				p = test.getSP();
				if(p <= ALPHA) pairwise(combos);
			}
			catch(IllegalArgumentException e) {
				//e.printStackTrace();
			}
			
		}//if >2
	}//compare >2 combos
	
	private void pairwise(List<Combination> combos) {
		children = new ArrayList<Comparison>();
		for(int i=0; i<combos.size()-1; i++) {
			Combination a = combos.get(i);
			for(int j=i+1; j<combos.size(); j++) {
				Combination b = combos.get(j);
				Comparison comp_i_j = new Comparison(data, valIndex);
				comp_i_j.compare(a, b);
				if(comp_i_j.getP()>0) this.children.add(comp_i_j);
			}//for j
		}//for i
	}//pairwise
	
	public double getP(){
		return p;
	}
	
	public List<Comparison> children() {
		return children;
	}
	
	public String toString() {
		String s = "";
		s += combo_a.toString() + " " + sign + " " + combo_b.toString() + ", p = " + decimalFormat.format(p);
		return s;
	}
	
	static void println(Object obj) {
		System.out.println(obj);
	}
}
