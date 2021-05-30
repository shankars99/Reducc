import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class Encryption extends StatefulWidget {
  @override
  _EncryptionState createState() => _EncryptionState();
}

class _EncryptionState extends State<Encryption> {
  TextEditingController tieWord = TextEditingController();

  late String len = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Summarizer"),
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              SizedBox(
                height: 100,
              ),
              TextField(
                controller: tieWord,
                decoration:
                    InputDecoration(hintText: "Enter text to display length"),
              ),
              SizedBox(
                height: 50,
              ),
              ElevatedButton(
                onPressed: () {
                  if (tieWord.text.toString().trim().length > 0) {
                    len = tieWord.text.toString();
                    setState(() {});
                  }
                },
                child: Text("Summarize"),
              ),
              SizedBox(
                height: 50,
              ),
              Container(
                margin: const EdgeInsets.all(10.0),
                width: 100.0,
                height: 100.0,
                child: Center(
                  child: Text(
                    "${len != "" ? len.length : ''}",
                    style: TextStyle(
                      fontSize: 25,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
