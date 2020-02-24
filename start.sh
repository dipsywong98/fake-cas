docker image build -t fakecas:dev .
docker container run --network=api_app-network --publish 3030:3030 --detach --name fakecas fakecas:dev
