import socket
import threading
import sys

username = input('Choose a username: ')

user = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    user.connect(('localhost', 3001))
except:
    print("Unable to connect to the server.")
    sys.exit()


def receive():
    while True:
        try:
            message = user.recv(1024).decode()
            if message == "USERNAME":
                user.send(username.encode())
            elif message.startswith("ERROR:"):
                print(message)
                user.close()
                sys.exit()
            else:
                print(message)
        except:
            print('An error occurred while receiving messages.')
            user.close()
            break


def texting():
    while True:
        try:
            message = input()
            user.send(f"{username}: {message}".encode())
        except:
            print("An error occurred while sending messages.")
            user.close()
            break


receive_thread = threading.Thread(target=receive)
receive_thread.start()

texting_thread = threading.Thread(target=texting)
texting_thread.start()
