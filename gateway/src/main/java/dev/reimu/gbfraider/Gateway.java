package dev.reimu.gbfraider;

import java.io.File;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Timer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Gateway {
    static {
        String logfilepath = ProgramProperties.getString("logfilepath");
        String absolute = new File(logfilepath).getAbsolutePath();
        System.setProperty("logfilepath", absolute);
        System.out.println("logfilepath is: "+absolute);
    }
	private final static Logger logger = LoggerFactory.getLogger("statistics");
	private static final Logger logger2 = LoggerFactory.getLogger("gateway");
	private static final Timer timer;
	static {
		LocalDateTime next = LocalDateTime.now().plusMinutes(5);
    	logger.info("next statistics task scheduled at:"+next);
		DumpStatisticsTask task = new DumpStatisticsTask();
		timer = new Timer("statistics");
    	timer.scheduleAtFixedRate(task
    			, new Date(next.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli())
    			, 10*60*1000);
	}
	
    public static void main(String[] args) throws Exception {
    	
    	Utils.makeJedisObject().close();
    	
    	//for multiple instances deployment
    	int port = 0;
    	String portStr = System.getProperty("port");
    	if(portStr!=null) {
    		port = Integer.parseInt(portStr);
    	}else {
    		port = ProgramProperties.getInt("port");
    	}
    	
		String ip = null;
		try (final DatagramSocket socket = new DatagramSocket()) {
			socket.connect(InetAddress.getByName("8.8.8.8"), 10002);
			ip = socket.getLocalAddress().getHostAddress();
		}
    	
    	logger2.info("ip address is:"+ip);
    	
    	Server servr = new Server(ip, port);
    	
    	Runtime.getRuntime().addShutdownHook(new Thread() {
    		@Override
    		public void run() {
    			logger2.info("exiting..");
    			try {
					servr.close();
					logger2.info("server shutdown");
				} catch (Exception e) {
					logger.error("",e);
				}
    			timer.cancel();
    			logger2.info("timer shutdown");
    		}
    	});
    	
    	servr.run();
    }
}
