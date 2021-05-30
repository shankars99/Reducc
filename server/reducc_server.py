from flask import Flask, jsonify
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import ast


app = Flask(__name__)

privKey = ""
pubKey  = ""

@app.route('/summarize/<body>', methods=['POST'])
def get_summarize(body):
    global privKey

    decryptor = PKCS1_OAEP.new(privKey)
    decrypted = decryptor.decrypt(ast.literal_eval(str(body)))
    res = jsonify({'message': decrypted})
    return res

@app.route('/get_key', methods=['POST'])
def get_key():
    global pubKey, privKey
    key = RSA.generate(1024)

    binPrivKey = key.exportKey('DER')
    binPubKey  =  key.publickey().exportKey('DER')

    privKey = RSA.importKey(binPrivKey)
    pubKey  =  RSA.importKey(binPubKey)

    encryptor = PKCS1_OAEP.new(pubKey)
    encrypted = encryptor.encrypt(b'encrypt this message')
    res = jsonify({'public_key':{
                        "n" : pubKey.n,
                        "e" : pubKey.e
                    }
                })

    return res

@app.route('/summarizer/<raw_text>',methods = ['POST'])
def summarizer(raw_text):
    print(raw_text)
    return jsonify({'raw_text': raw_text})

@app.route('/',methods = ['GET', 'POST'])
def home():
    return jsonify({'message': 'Welcome to the server', 'status': 200})
