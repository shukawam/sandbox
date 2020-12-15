-- 作業するスキーマに対してRESTアクセスを有効にする(SQL Developer Webで実施しても同様の結果が得られる)
BEGIN
    ords.enable_schema(
        p_enabled => true, 
        p_schema => 'SHUKAWAM', 
        p_url_mapping_type => 'BASE_PATH', 
        p_url_mapping_pattern => 'shukawam',
        p_auto_rest_auth => true
    );

    COMMIT;
END;

-- 認証トークンを生成できるようにする
DECLARE
    l_roles     owa.vc_arr;
    l_modules   owa.vc_arr;
    l_patterns  owa.vc_arr;
BEGIN
    l_roles(1) := 'SQL Developer';
    l_patterns(1) := '/items/*';
    ords.define_privilege(
        p_privilege_name => 'rest_privilege',
        p_roles => l_roles, 
        p_patterns => l_patterns, 
        p_modules => l_modules,
        p_label => '',
        p_description => '', 
        p_comments => NULL
    );
    COMMIT;
END;

-- OAuthクライアントの作成
BEGIN
    oauth.create_client(
        p_name => 'Rest Client', 
        p_grant_type => 'client_credentials', 
        p_owner => 'SHUKAWAM', 
        p_description => 'Rest Client',
        p_support_email => 'oracle@oracle.com',
        p_privilege_names => 'rest_privilege'
    );

    COMMIT;
END;

-- クライアントアプリケーション用にロールを作成する
BEGIN
    OAUTH.grant_client_role(
        p_client_name => 'Rest Client',
        p_role_name => 'SQL Developer'
    );
    COMMIT;
END;

-- client_id, client_secretを取得する
SELECT id, name, client_id, client_secret FROM user_ords_clients;

-- ID       NAME        CLIENT_ID                   CLIENT_SECRET
-- 10023	Rest Client	Y0Fphjzg3bLgJ0EVwhLAYw..	iANFaULcurStdXLySLpCnA..

-- テーブルへのORDSアクセスを有効にする
BEGIN
    ords.define_service(
        p_module_name => 'items', 
        p_base_path => '', 
        p_pattern => 'items/', 
        p_method => 'GET', 
        p_source_type => ords.source_type_collection_item,
        p_source => 'SELECT * FROM ITEMS');

    COMMIT;
END;