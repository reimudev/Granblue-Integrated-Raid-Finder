package dev.reimu.gbfraider.client;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Boss{
	public final int id;
	public final List<String> lvlAndNames;
	private final String desc;
	public Boss(int id, int level, String englishName, String jpName) {
		this.id = id;
		List<String> lvlAndNames = new ArrayList<>();
		/*
		 * some bosses do not have a level in tweets, 
		 * this exceptional error mainly happens to event bosses
		 */
		if(level>0) {
			lvlAndNames.add("Lvl "+level+" "+englishName);
			lvlAndNames.add("Lv"+level+" "+jpName);
		}else {
			lvlAndNames.add(englishName);
			lvlAndNames.add(jpName);
		}
		desc = id+","+level+","+englishName;
		this.lvlAndNames = Collections.unmodifiableList(lvlAndNames);
	}
	public boolean beThisBoss(String text) {
		for(String s:lvlAndNames) {
			int idx = text.indexOf(s);
			if(idx<0) {
				continue;
			}
			/*
			 * some boss name "contains" another boss (be a prefix of another boss name), 
			 * so a simple indexOf will not do.
			 * isWhiteSpace also does not work, because English names do not have the middle dot(・) but have a space 
			 * at that position.
			 * check for \r\n is for normal bosses which have an image link following boss name, 
			 * check for out of bounds is for event bosses or deliberately shortened tweets which do not have an image link
			 */
			int next = idx+s.length();
			if(next>=text.length()) {
				return true;
			}
			char ch = text.charAt(next);
			if(ch=='\r' || ch=='\n') {
				return true;
			}
		}
		return false;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((desc == null) ? 0 : desc.hashCode());
		result = prime * result + id;
		result = prime * result + ((lvlAndNames == null) ? 0 : lvlAndNames.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Boss other = (Boss) obj;
		if (desc == null) {
			if (other.desc != null)
				return false;
		} else if (!desc.equals(other.desc))
			return false;
		if (id != other.id)
			return false;
		if (lvlAndNames == null) {
			if (other.lvlAndNames != null)
				return false;
		} else if (!lvlAndNames.equals(other.lvlAndNames))
			return false;
		return true;
	}
	public String toString(){
		return desc;
	}
}