import socket
import threading

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 3001))
server.listen()

users = []
usernames = []


def broadcast(message, sender=None):
    for user in users:
        if user != sender:
            try:
                user.send(message)
            except:
                user.close()
                if user in users:
                    users.remove(user)


def handle(user):
    while True:
        try:
            message = user.recv(1024)
            broadcast(message, sender=user)
        except:
            index = users.index(user)
            user.close()
            username = usernames[index]
            broadcast(f"{username} left the chat".encode())
            users.remove(user)
            usernames.remove(username)
            break


def receive():
    while True:
        user, addr = server.accept()
        print(f"Connected with {addr}")

        user.send("USERNAME".encode())
        username = user.recv(1024).decode()

        if username in usernames:
            user.send("ERROR: Username already taken.".encode())
            user.close()
            continue

        usernames.append(username)
        users.append(user)

        print(f"Username: {username}")
        broadcast(f"{username} joined the chat".encode())

        thread = threading.Thread(target=handle, args=(user,))
        thread.start()


print("Server is activated and running.")
receive()
