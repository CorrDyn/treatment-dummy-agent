# Demo purposes - dummy-agent

This repo contains a dummy sample service that illustrates how [skaffold][skaffold] configuration (`skaffold.yaml`) works to build and automatically re-deploy the application locally on your computer as you move through the development cycle. 

### How it works

The `skaffold.yaml` file defines rules for building and deploying the Dummy service (and some dependencies) in a local Kubernetes cluster ([Minikube][minikube]). Skaffold will automatically pull the service dependencies, listed in the `requires` section of the file, build the application and deploy it to your local environment by running a single command. 

The Dummy service relies on 2 containers: a [redis][redis] container and a [Google Cloud Spanner emulator][spanner-emulator] container. These containers will be used to emulate a production environment in your local machine. 

All running services will be mapped to ports on your local machine so you can access the corresponding containers so you can call the service API, load data into the Cloud spanner emulator or modify entries in the redis store.

```text
  
                                              |
  [namespace: dummies]                        |   [namespace: dev-agents]
                                              |
                                              |
    +-------------+                           |           +------------------+
    | Dummy agent | <-----------------------------------> | Spanner emulator |
    +-------------+ <------------+            |           +------------------+
          v                      |            |                            v
          v                      |            |           +-------+        v
          v                      +----------------------> | Redis |        v
          v                                   |           +-------+        v
          v                                   |              v             v
==========v===================================+==============v=============v=================
     [host:8080]                                        [host:6379]   [host:9010, host:9020]
```

### Getting started
* Make sure you have [Docker][docker-install] installed.
* Make sure you have the [Google Cloud SDK][gcloud-sdk] installed.
* Install the `kustomize`, `skaffold`, `minikube` and `kubectl` using `gcloud`
    ```console
    $ gcloud components install kustomize skaffold minikube kubectl
    ```
* Make sure `minikube` is running by issuing the following commands
    ```console 
    # verify running
    $ minikube status
      minikube
      type: Control Plane
      host: Running
      kubelet: Running
      apiserver: Running
      kubeconfig: Configured
      docker-env: in-use

    # or start minikube if it's not running
    $ minikube start
    ```
* Export the right environment variables to communicate with minikube 
    ```console
    $ eval $(minikube docker-env)
    ```

* Run the [skaffold][skaffold] development configuration 
    ```console
    $ skaffold dev --port-forward
    ```

    The above command will build and run the sample service an it's dependencies.

### Testing the service from your host machine

Once the services start, they will be mapped to your local ports. The service won't have any data, you can verify this by calling one of the endpoints:

```console
$ curl -H 'content-type: application/json' -i localhost:8080/api/v1/models/abc
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 38
ETag: W/"26-zTcnuDGmLHWE1vIdV9Px3Q9X0YE"
Date: Fri, 30 Jul 2021 13:16:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Model 'abc' does not exist"}
```

You can add a record to the redis store as follows:

```console
$ curl -H 'content-type: application/json' -i \
  -X PUT \
  --data '{"version": "v1.1.1", "description": "Nice model"}' localhost:8080/api/v1/models/abc
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 2
ETag: W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"
Date: Fri, 30 Jul 2021 13:18:37 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

Issuing the first command again will show the entry we just created:

```console
$ curl -H 'content-type: application/json' -i localhost:8080/api/v1/models/abc
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 47
ETag: W/"2f-Iuj8rToNfhJx54uVnmrZEg0fQPM"
Date: Fri, 30 Jul 2021 13:19:42 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"version":"v1.1.1","description":"Nice model"}%
```

### Q&A

#### How to load / modify data in the Cloud Spanner emulator from my host machine ?

* Create a `gcloud configuration` called `spanner-emulator` following these steps:
    ```console
    $ gcloud config configurations create spanner-emulator
    $ gcloud config set auth/disable_credentials true
    $ gcloud config set project your-project-id
    $ gcloud config set api_endpoint_overrides/spanner http://localhost:9020/
    ```

* Install [spanner-cli][spanner-cli].
* Make sure your Cloud Spanner Emulator container is running (`skaffold dev` is running).
* Create a Cloud spanner instance and a database:
    ```console
    # Verify if there are any instances in your configuration
    $ gcloud spanner instances list
    Listed 0 items.

    # Create an instance in the spanner emulator
    $ gcloud spanner instances create test-instance \
      --config=emulator-config \
      --description="Test instance" \
      --nodes 1

    # Create a database from a schema file in the test-instance
    $ gcloud spanner databases create song-db \
      --instance test-instance \
      --ddl-file ./spanner-dds/schema.sql
    ```

#### How can I monitor what is going on in the Redis store ? 

Redis has a convenient command called `monitor`. You can 

### More information on the tools in this configuration

* [Docker][docker-install]
* [Minikube][minikube]
* [Kustomize][kustomize-install]
* [Skaffold][skaffold-install]


[gcloud-sdk]: https://cloud.google.com/sdk/docs/install
[docker-install]: https://docs.docker.com/get-docker/
[kustomize-install]: https://kubectl.docs.kubernetes.io/installation/kustomize/
[minikube]: https://minikube.sigs.k8s.io/docs/start/
[redis]: https://redis.io/
[skaffold]: https://skaffold.dev
[skaffold-install]: https://skaffold.dev/docs/install/
[spanner-cli]: https://github.com/cloudspannerecosystem/spanner-cli
[spanner-emulator]: https://cloud.google.com/spanner/docs/emulator
