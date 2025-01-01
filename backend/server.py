import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 3000))

server.listen(5)

while True:
    client, addr = server.accept()
    print(client.recv(1024).decode())
    client.send("Hello from Server".encode())
