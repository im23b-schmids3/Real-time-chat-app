import socket

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('localhost', 3000))

user_message = client.send(input("Enter message here: ").encode())
print(client.recv(1024).decode())
