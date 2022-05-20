# readme

namespace 作成

```bash
k create ns oci-sm
```

サンプルアプリケーション（Bookinfo）デプロイ

```bash
k apply -f 01_bookinfo.yaml
```

OCI Service Mesh 関連リソース（Mesh, VirtualService, VirtualDeployment, VirtualServiceRouteTable, IngressGateway, IngressGatewayRouteTable, AccessPolicy）のデプロイ

```bash
k apply -f 02_meshify.yaml
```

namespace 単位でサービスプロキシをサイドカーとして自動的にインジェクションするためのラベルを作成

```bash
k label ns oci-sm servicemesh.oci.oracle.com/sidecar-injection=enabled
```

OCI Service Mesh 関連リソース（VirtualDeploymentBinding, IngressGatewayDeployment）のデプロイ

```bash
k apply -f 03_binding.yaml
```

Mesh 外から Mesh 内へアクセスするためのエンドポイントを公開

```bash
kubectl apply -f 04_ingress.yaml
```

Egress のアクセスポリシーを追加

```bash
k apply -f 05_egress_policy.yaml
```

LB の IP を確認する。

```bash
k -n oci-sm get svc | grep -i ingress
bookinfo-ingress   LoadBalancer   10.96.246.83    <public-ip>  80:31776/TCP,443:31309/TCP   4m34s
```

DNS レコードを登録する or `C:\Windows\System32\drivers\etc\hosts` を修正する

```txt
<public-ip> <your-host>
```

OCI Logging のロググループを新規作成

```bash
oci logging log-group create \
--compartment-id $C \
--display-name bookinfo \
--profile PHOENIX
```

ロググループの OCID 取得

```bash
oci logging log-group list \
-c $C \
--query 'data[?"display-name"==`bookinfo`].id' \
--profile PHOENIX
```

カスタムログを作成

```bash
oci logging log create \
--log-group-id <log-group-id> \
--display-name bookinfo-logs \
--log-type custom \
--profile PHOENIX
```

動的グループの OCID 取得

```bash
oci iam dynamic-group list \
--query 'data[?"name"==`<your-dynamic-group-name>`].id' \
--all
```

エージェント作成

```bash
oci logging agent-configuration create \
--compartment-id $C \
--is-enabled true \
--service-configuration file://logconfig.json \
--display-name bookinfo-LoggingAgent \
--description "Custom agent config for mesh" \
--group-association '{"groupList": ["<dynamic-group-ocid>"]}' \
--profile PHOENIX
```

クラスターロール作成

```bash
k apply -f 06_cluster-role.yaml
```
