-- User作成
CREATE USER shukawam IDENTIFIED BY Passw0rd19941009;

-- 権限付与
GRANT "CONNECT" TO shukawam;
GRANT "RESOURCE" TO shukawam;
GRANT UNLIMITED TABLESPACE TO shukawam; -- 多分だけど、これは不要