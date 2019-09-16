package dev.reimu.gbfraider;

import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.sql.Array;
import java.sql.Blob;
import java.sql.CallableStatement;
import java.sql.Clob;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.NClob;
import java.sql.PreparedStatement;
import java.sql.SQLClientInfoException;
import java.sql.SQLException;
import java.sql.SQLWarning;
import java.sql.SQLXML;
import java.sql.Savepoint;
import java.sql.Statement;
import java.sql.Struct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.Executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.netty.channel.ChannelHandlerContext;
import io.netty.util.IllegalReferenceCountException;
import io.netty.util.ReferenceCountUtil;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class Utils {
	
	private static final Logger logger = LoggerFactory.getLogger("gateway");
	
	public static String ip;
	static {
		try (final DatagramSocket socket = new DatagramSocket()) {
			socket.connect(InetAddress.getByName("8.8.8.8"), 10002);
			ip = socket.getLocalAddress().getHostAddress();
		} catch (SocketException | UnknownHostException e) {
			throw new Error(e);
		}
	}
	
	static JedisPool pool;
	static {
		int size = ProgramProperties.getInt("redis.poolsize");
		JedisPoolConfig config = new JedisPoolConfig();
		config.setMaxTotal(size);
		config.setMaxIdle(size);
		config.setMinIdle(size);
		config.setBlockWhenExhausted(false);
		String pwd = ProgramProperties.getString("statistics.redis.passwd");
		if(pwd!=null && pwd.length()>0) {
			pool = new JedisPool(config
					,ProgramProperties.getString("statistics.redis.addr")
					,ProgramProperties.getInt("statistics.redis.port")
					,2000
					,pwd);
		}else {
			pool = new JedisPool(config
					,ProgramProperties.getString("statistics.redis.addr")
					,ProgramProperties.getInt("statistics.redis.port"));
		}
		
		logger.info("initialize "+size+" redis connections");
		
		List<Jedis> preAllocates = new ArrayList<>();
		for(int i=0;i<size;++i) {
			preAllocates.add(pool.getResource());
		}
		for(int i=0;i<size;++i) {
			preAllocates.get(i).close();
		}
	}
	public static Jedis makeJedisObject() {
		return makeJedisObject(0);
	}
	public static Jedis makeJedisObject(int dbIndex) {
		try {
			Jedis jd = pool.getResource();
			jd.select(dbIndex);
			return jd;
		} catch (Exception e) {
			logger.error("cannot fetch redis connection:"+e.getMessage());
			throw new RuntimeException(e);
		}
	}
	
	public static final String statisticsPrefix = "statistics:";
	private static final int statisticsInterval = ProgramProperties.getInt("statistics.interval");
	private static final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy:MM:dd:HH:");
	private static final DateTimeFormatter fmt2 = DateTimeFormatter.ofPattern("yyyy:MM:dd:");
	public static String makeStatisticsCachekey(LocalDateTime time) {
		String key = statisticsPrefix+time.format(fmt);
		int minute = time.getMinute();
		//0 for 0th-9th, 1 for 10th-19th minute, ...
		key += (minute/statisticsInterval);
		return key;
	}
	public static String makeStatisticsCachekey(LocalDate date, int hour, int interval) {
		String key = "statistics:"+date.format(fmt2);
		key += (hour<10 ? ("0" + hour) : hour) + ":" + interval;
		return key;
	}
	
	public static String getIpAddress(ChannelHandlerContext ctx) {
		InetSocketAddress isa = (InetSocketAddress)ctx.channel().remoteAddress();
		String key = isa.getAddress().toString();
		return key;
	}
	
	public static void releaseNettyObjectNoMatterWhat(Object obj) {
		if(obj==null)return;
		try {
			ReferenceCountUtil.release(obj);
		} catch (IllegalReferenceCountException e) {
		}
	}
	
	private static final Logger logger2 = LoggerFactory.getLogger("gateway");
	private static String dbURL;
	static {
		dbURL = ProgramProperties.getString("database.dir");
	}
	public static ThreadLocal<Connection> threadLocalConnectionPool = new ThreadLocal<Connection>() {
		protected Connection initialValue() {
			try {
				return new MyConnection(DriverManager.getConnection("jdbc:sqlite:"+dbURL));
			} catch (SQLException e) {
				throw new Error(e);
			}
		};
	};
	static {
		Connection connection = threadLocalConnectionPool.get();
    	try {
    		Statement statement = connection.createStatement();
			statement.executeUpdate(ProgramProperties.getString("sql_initiation"));
			statement.close();
			logger2.info("database file prepared");
		} catch (SQLException e) {
			throw new Error(e);
		}
	}
	
	public static void saveOrUpdateStatRecord(StatRecord record) throws SQLException {
		Connection conn = threadLocalConnectionPool.get();
		PreparedStatement pstm = conn.prepareStatement(ProgramProperties.getString("sql_insertion"));
		pstm.setString(1, record.dt);
		pstm.setInt(2, record.h);
		pstm.setInt(3, record.sec);
		pstm.setInt(4, record.boss);
		pstm.setInt(5, record.cnt);
		pstm.setInt(6, record.cnt);
		pstm.executeUpdate();
		pstm.close();
	}
	
	public static final class StatRecord{
		public String dt;
		public int h;
		public int sec;
		public int boss;
		public int cnt;
	}
	
	public static class MyConnection implements Connection{
		private Connection impl;
		public MyConnection(Connection impl) {
			this.impl = impl;
		}
		public <T> T unwrap(Class<T> iface) throws SQLException {
			return impl.unwrap(iface);
		}
		public boolean isWrapperFor(Class<?> iface) throws SQLException {
			return impl.isWrapperFor(iface);
		}
		public Statement createStatement() throws SQLException {
			return impl.createStatement();
		}
		public PreparedStatement prepareStatement(String sql) throws SQLException {
			return impl.prepareStatement(sql);
		}
		public CallableStatement prepareCall(String sql) throws SQLException {
			return impl.prepareCall(sql);
		}
		public String nativeSQL(String sql) throws SQLException {
			return impl.nativeSQL(sql);
		}
		public void setAutoCommit(boolean autoCommit) throws SQLException {
			impl.setAutoCommit(autoCommit);
		}
		public boolean getAutoCommit() throws SQLException {
			return impl.getAutoCommit();
		}
		public void commit() throws SQLException {
			impl.commit();
		}
		public void rollback() throws SQLException {
			impl.rollback();
		}
		public void realClose() throws SQLException{
			impl.close();
		}
		public void close() throws SQLException {
			//do nothing
		}
		public boolean isClosed() throws SQLException {
			return impl.isClosed();
		}
		public DatabaseMetaData getMetaData() throws SQLException {
			return impl.getMetaData();
		}
		public void setReadOnly(boolean readOnly) throws SQLException {
			impl.setReadOnly(readOnly);
		}
		public boolean isReadOnly() throws SQLException {
			return impl.isReadOnly();
		}
		public void setCatalog(String catalog) throws SQLException {
			impl.setCatalog(catalog);
		}
		public String getCatalog() throws SQLException {
			return impl.getCatalog();
		}
		public void setTransactionIsolation(int level) throws SQLException {
			impl.setTransactionIsolation(level);
		}
		public int getTransactionIsolation() throws SQLException {
			return impl.getTransactionIsolation();
		}
		public SQLWarning getWarnings() throws SQLException {
			return impl.getWarnings();
		}
		public void clearWarnings() throws SQLException {
			impl.clearWarnings();
		}
		public Statement createStatement(int resultSetType, int resultSetConcurrency) throws SQLException {
			return impl.createStatement(resultSetType, resultSetConcurrency);
		}
		public PreparedStatement prepareStatement(String sql, int resultSetType, int resultSetConcurrency)
				throws SQLException {
			return impl.prepareStatement(sql, resultSetType, resultSetConcurrency);
		}
		public CallableStatement prepareCall(String sql, int resultSetType, int resultSetConcurrency)
				throws SQLException {
			return impl.prepareCall(sql, resultSetType, resultSetConcurrency);
		}
		public Map<String, Class<?>> getTypeMap() throws SQLException {
			return impl.getTypeMap();
		}
		public void setTypeMap(Map<String, Class<?>> map) throws SQLException {
			impl.setTypeMap(map);
		}
		public void setHoldability(int holdability) throws SQLException {
			impl.setHoldability(holdability);
		}
		public int getHoldability() throws SQLException {
			return impl.getHoldability();
		}
		public Savepoint setSavepoint() throws SQLException {
			return impl.setSavepoint();
		}
		public Savepoint setSavepoint(String name) throws SQLException {
			return impl.setSavepoint(name);
		}
		public void rollback(Savepoint savepoint) throws SQLException {
			impl.rollback(savepoint);
		}
		public void releaseSavepoint(Savepoint savepoint) throws SQLException {
			impl.releaseSavepoint(savepoint);
		}
		public Statement createStatement(int resultSetType, int resultSetConcurrency, int resultSetHoldability)
				throws SQLException {
			return impl.createStatement(resultSetType, resultSetConcurrency, resultSetHoldability);
		}
		public PreparedStatement prepareStatement(String sql, int resultSetType, int resultSetConcurrency,
				int resultSetHoldability) throws SQLException {
			return impl.prepareStatement(sql, resultSetType, resultSetConcurrency, resultSetHoldability);
		}
		public CallableStatement prepareCall(String sql, int resultSetType, int resultSetConcurrency,
				int resultSetHoldability) throws SQLException {
			return impl.prepareCall(sql, resultSetType, resultSetConcurrency, resultSetHoldability);
		}
		public PreparedStatement prepareStatement(String sql, int autoGeneratedKeys) throws SQLException {
			return impl.prepareStatement(sql, autoGeneratedKeys);
		}
		public PreparedStatement prepareStatement(String sql, int[] columnIndexes) throws SQLException {
			return impl.prepareStatement(sql, columnIndexes);
		}
		public PreparedStatement prepareStatement(String sql, String[] columnNames) throws SQLException {
			return impl.prepareStatement(sql, columnNames);
		}
		public Clob createClob() throws SQLException {
			return impl.createClob();
		}
		public Blob createBlob() throws SQLException {
			return impl.createBlob();
		}
		public NClob createNClob() throws SQLException {
			return impl.createNClob();
		}
		public SQLXML createSQLXML() throws SQLException {
			return impl.createSQLXML();
		}
		public boolean isValid(int timeout) throws SQLException {
			return impl.isValid(timeout);
		}
		public void setClientInfo(String name, String value) throws SQLClientInfoException {
			impl.setClientInfo(name, value);
		}
		public void setClientInfo(Properties properties) throws SQLClientInfoException {
			impl.setClientInfo(properties);
		}
		public String getClientInfo(String name) throws SQLException {
			return impl.getClientInfo(name);
		}
		public Properties getClientInfo() throws SQLException {
			return impl.getClientInfo();
		}
		public Array createArrayOf(String typeName, Object[] elements) throws SQLException {
			return impl.createArrayOf(typeName, elements);
		}
		public Struct createStruct(String typeName, Object[] attributes) throws SQLException {
			return impl.createStruct(typeName, attributes);
		}
		public void setSchema(String schema) throws SQLException {
			impl.setSchema(schema);
		}
		public String getSchema() throws SQLException {
			return impl.getSchema();
		}
		public void abort(Executor executor) throws SQLException {
			impl.abort(executor);
		}
		public void setNetworkTimeout(Executor executor, int milliseconds) throws SQLException {
			impl.setNetworkTimeout(executor, milliseconds);
		}
		public int getNetworkTimeout() throws SQLException {
			return impl.getNetworkTimeout();
		}
	}
}
