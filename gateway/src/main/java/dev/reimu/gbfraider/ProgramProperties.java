package dev.reimu.gbfraider;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ProgramProperties {
	
	private final static Properties prop;

	static {
		prop = new Properties();
		try {
			prop.load(ProgramProperties.class.getClassLoader().getResourceAsStream("main.properties"));
			String active = prop.getProperty("active");
			InputStream target = ProgramProperties.class.getClassLoader().getResourceAsStream("program-"+active+".properties");
			if(target==null) {
				target = ProgramProperties.class.getClassLoader().getResourceAsStream("program.properties");
			}
			prop.load(target);
		} catch (IOException e) {
			throw new Error(e);
		}
	}
	
	public static String getString(String name) {
		return prop.getProperty(name);
	}
	
	public static int getInt(String name) {
		return Integer.parseInt(getString(name));
	}
}