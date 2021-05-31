from flask import Flask, jsonify, request
from Crypto.Util.number import *
import requests
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
def chunkstring(string, length):
    return (string[0+i:length+i].replace('-', '') for i in range(0, len(string), length))

@app.route('/summarize', methods=['POST'])
def get_summarize():
    body = request.get_json()['msg']
    print(body)
    coded_words = body.split(' ')
    sub_char_len = 2
    print(coded_words)
    ans = ""
    for coded_word in coded_words:
        #print(coded_word)
        chunk_coded = list(chunkstring(coded_word, 15))
        for chunk_coded_word in chunk_coded:
            print(chunk_coded_word)
            r=str(pow(int(chunk_coded_word),d, n))
            for i in range(len(r)//sub_char_len):
                ans+=chr(int(r[sub_char_len*(i):sub_char_len*(i+1)]))
        ans+=" "

    body = ans
    resp = requests.post('https://api.smrzr.io/v1/summarize?num_sentences=5&algorithm=kmeans&min_length=40&max_length=500', data=body)
    summary = resp.json()['summary']


    res = jsonify({'message': summary.lower()})
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
