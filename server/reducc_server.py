from flask import Flask, jsonify
from Crypto.Util.number import *
from Crypto import Random
import Crypto
import libnum

app = Flask(__name__)

bits=24
p = Crypto.Util.number.getPrime(bits, randfunc=Crypto.Random.get_random_bytes)
q = Crypto.Util.number.getPrime(bits, randfunc=Crypto.Random.get_random_bytes)

n = p*q
PHI=(p-1)*(q-1)

e=65537
d=libnum.invmod(e,PHI)

msgs="hello there world"

ms = msgs.split(" ")

'''
cod_msg = ""
for msg in ms:
        m = ""
        for ele in msg:
            m += str(ord(ele))
        m = int(m)
        c=pow(m,e,n)
        print("m " + str(m))
        cod_msg += str(c) + " "
        print("c " + str(c))

cod_msg = cod_msg[:len(cod_msg)-1]
print(cod_msg)
cods = cod_msg.split('-')
print(cods)
'''

@app.route('/summarize/<body>', methods=['POST'])
def get_summarize(body):
    coded_words = body.split(' ')
    print(coded_words)
    ans = ""
    for coded_word in coded_words:
        r=str(pow(int(coded_word),d, n))
        for i in range(len(r)//3):
            ans+=chr(int(r[3*(i):3*(i+1)])-3)
        ans+=" "

    res = jsonify({'message': ans})
    return res

@app.route('/get_key', methods=['GET'])
def get_key():
    res = jsonify({
                        "n" : n,
                        "e" : e
                })

    return res

@app.route('/summarizer/<raw_text>',methods = ['POST'])
def summarizer(raw_text):
    print(raw_text)
    return jsonify({'raw_text': raw_text})

@app.route('/',methods = ['GET', 'POST'])
def home():
    return jsonify({'message': 'Welcome to the server', 'status': 200})
