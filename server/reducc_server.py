from flask import Flask, jsonify, request
from Crypto.Util.number import *
import requests
import Crypto
import libnum

app = Flask(__name__)

# on loading the server generate the RSA keypair
bits = 24

p = Crypto.Util.number.getPrime(bits, randfunc=Crypto.Random.get_random_bytes)
q = Crypto.Util.number.getPrime(bits, randfunc=Crypto.Random.get_random_bytes)

n = p*q
PHI = (p-1)*(q-1)

e = 65537
d = libnum.invmod(e, PHI)


@app.route('/getKey', methods=['GET'])
def get_key():
    res = jsonify({
        "n": n,
        "e": e
    })

    return res


SubSubWordSize = 15
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

# handles the summarization
# note: since running it on the PC takes 40 minutes to load using an external source for the example


def summarize(plainText):
    resp = requests.post(
        'https://api.smrzr.io/v1/summarize?num_sentences=5&algorithm=kmeans&min_length=40&max_length=500', data=plainText)
    summary = resp.json()['summary']
    return summary


# substrings the given string into 15 character long ones
def chunkstring(string, length=SubSubWordSize):
    return (string[0+i:length+i].replace('~', '') for i in range(0, len(string), length))


def rsa_encode(plainText, clientKey):
    words = plainText.split(' ')
    cipherText = ""
    SubSubWordTokenSize = 15
    # iterate through each token so as to split then into subtokens of manageable sizes as some tokens are too large
    for wordToken in words:
        cipherToken = ""

        subWordTokens = list(chunkstring(wordToken, 4))

        # iterate through the sub-sub-tokens and encode them
        for subSubWordToken in subWordTokens:

            collectionOfSubSubWordTokenChars = ""

            for subSubWordTokenChars in subSubWordToken:

                # get the ASCII value of the character in the sub-sub-token
                collectionOfSubSubWordTokenChars += str(ord(subSubWordTokenChars))

            cipherToken = str(pow(int(collectionOfSubSubWordTokenChars), e, int(clientKey)))

            # pad a character at the end to make all the encoded words have the same size of 15
            cipherText += cipherToken.ljust(SubSubWordTokenSize, '~')

        # add a space bar to the end of the word
        cipherText += " "
    return (cipherText)


def rsa_decode(cipherText):
    # tokenize the cipherText
    words = cipherText.split(' ')
    plainText = ""

    # group together number of integers to convert to ASCII
    subSubWordTokenSize = 2

    # iterate through the words
    for wordToken in words:

        # get the formatted subword list
        subWordToken = list(chunkstring(wordToken))

        # iterate through each subword and decode them
        for subSubWordToken in subWordToken:

            # RSA decoding using the private key : c^d%n
            decoded_token = str(pow(int(subSubWordToken), d, n))
            # group together the characters so as to form words, since each group has 2 characters, iterate to half the length
            for i in range(len(decoded_token)//subSubWordTokenSize):

                # splice the range over 2 integer values and get ASCII character
                plainText += chr(
                    int(decoded_token[subSubWordTokenSize*(i):subSubWordTokenSize*(i+1)]))

        # add a space-bar to the end of the word
        plainText += " "
    return plainText

# handle the HTTP-POST at summarize


@app.route('/summarize', methods=['POST'])
def handleSummarize():
    # extract from the request json the value of key 'cipher_text'
    cipherText = request.get_json()['cipher_text']
    clientKey = request.get_json()['n']
    plainText = rsa_decode(cipherText)

    rsa_encode(plainText, clientKey)
    # return a json with the summarized text
    res = jsonify({'summarized_text': rsa_encode(summarize(plainText),clientKey)})
    return res


# test connection a homepage
@app.route('/', methods=['GET', 'POST'])
def home():
    return jsonify({'message': 'Server is up and running', 'status': 200})
