import 'package:flutter/material.dart';

class Screen1 extends StatefulWidget {
  const Screen1({super.key});
  @override
  Screen1State createState() => Screen1State();
}

class Screen1State extends State<Screen1> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          constraints: const BoxConstraints.expand(),
          color: Color(0xFFFFFFFF),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: IntrinsicHeight(
                  child: Container(
                    color: Color(0xFFF2E1DA),
                    width: double.infinity,
                    height: double.infinity,
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          IntrinsicHeight(
                            child: Container(
                              padding: const EdgeInsets.only(bottom: 72),
                              width: double.infinity,
                              child: Column(
                                children: [
                                  IntrinsicHeight(
                                    child: Container(
                                      margin: const EdgeInsets.only(
                                        bottom: 48,
                                        left: 27,
                                        right: 27,
                                      ),
                                      width: double.infinity,
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          IntrinsicWidth(
                                            child: IntrinsicHeight(
                                              child: Container(
                                                padding: const EdgeInsets.only(
                                                  top: 5,
                                                  bottom: 5,
                                                  left: 11,
                                                  right: 11,
                                                ),
                                                margin: const EdgeInsets.only(
                                                  top: 14,
                                                  right: 27,
                                                ),
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      "9:41",
                                                      style: TextStyle(
                                                        color: Color(
                                                          0xFF000000,
                                                        ),
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            child: Container(
                                              margin: const EdgeInsets.only(
                                                right: 5,
                                              ),
                                              height: 32,
                                              width: double.infinity,
                                              child: Image.network(
                                                "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/ktfa0k1j_expires_30_days.png",
                                                fit: BoxFit.fill,
                                              ),
                                            ),
                                          ),
                                          IntrinsicWidth(
                                            child: IntrinsicHeight(
                                              child: Container(
                                                margin: const EdgeInsets.only(
                                                  top: 19,
                                                ),
                                                child: Row(
                                                  children: [
                                                    Container(
                                                      margin:
                                                          const EdgeInsets.only(
                                                            right: 8,
                                                          ),
                                                      width: 18,
                                                      height: 12,
                                                      child: Image.network(
                                                        "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/cik9mpi9_expires_30_days.png",
                                                        fit: BoxFit.fill,
                                                      ),
                                                    ),
                                                    Container(
                                                      margin:
                                                          const EdgeInsets.only(
                                                            right: 7,
                                                          ),
                                                      width: 17,
                                                      height: 11,
                                                      child: Image.network(
                                                        "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/56bh31kq_expires_30_days.png",
                                                        fit: BoxFit.fill,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 27,
                                                      height: 13,
                                                      child: Image.network(
                                                        "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/fm2gtj8k_expires_30_days.png",
                                                        fit: BoxFit.fill,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  IntrinsicWidth(
                                    child: IntrinsicHeight(
                                      child: Container(
                                        margin: const EdgeInsets.only(
                                          bottom: 40,
                                        ),
                                        child: Row(
                                          children: [
                                            IntrinsicWidth(
                                              child: IntrinsicHeight(
                                                child: Container(
                                                  color: Color(0xFFFFFFFF),
                                                  padding: const EdgeInsets.all(
                                                    8,
                                                  ),
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        "build",
                                                        style: TextStyle(
                                                          color: Color(
                                                            0xFF965541,
                                                          ),
                                                          fontSize: 41,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                            IntrinsicWidth(
                                              child: IntrinsicHeight(
                                                child: Container(
                                                  decoration: BoxDecoration(
                                                    border: Border.all(
                                                      color: Color(0xFFFFFFFF),
                                                      width: 3,
                                                    ),
                                                  ),
                                                  padding:
                                                      const EdgeInsets.only(
                                                        top: 8,
                                                        bottom: 8,
                                                        left: 10,
                                                        right: 10,
                                                      ),
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        "up",
                                                        style: TextStyle(
                                                          color: Color(
                                                            0xFF965541,
                                                          ),
                                                          fontSize: 41,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  IntrinsicWidth(
                                    child: IntrinsicHeight(
                                      child: Container(
                                        padding: const EdgeInsets.only(
                                          left: 28,
                                          right: 28,
                                        ),
                                        margin: const EdgeInsets.only(
                                          bottom: 40,
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            IntrinsicWidth(
                                              child: IntrinsicHeight(
                                                child: Container(
                                                  margin: const EdgeInsets.only(
                                                    bottom: 19,
                                                  ),
                                                  child: Stack(
                                                    clipBehavior: Clip.none,
                                                    children: [
                                                      Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Container(
                                                            width: 99,
                                                            height: 99,
                                                            child: Image.network(
                                                              "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/edjxx7p3_expires_30_days.png",
                                                              fit: BoxFit.fill,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                      Positioned(
                                                        bottom: 0,
                                                        left: 22,
                                                        width: 112,
                                                        height: 77,
                                                        child: Container(
                                                          decoration: BoxDecoration(
                                                            borderRadius:
                                                                BorderRadius.circular(
                                                                  45,
                                                                ),
                                                            color: Color(
                                                              0xFFFFFFFF,
                                                            ),
                                                          ),
                                                          transform:
                                                              Matrix4.translationValues(
                                                                0,
                                                                53,
                                                                0,
                                                              ),
                                                          width: 112,
                                                          height: 77,
                                                          child: SizedBox(),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                            IntrinsicWidth(
                                              child: IntrinsicHeight(
                                                child: Container(
                                                  margin: const EdgeInsets.only(
                                                    bottom: 19,
                                                    left: 63,
                                                  ),
                                                  child: Stack(
                                                    clipBehavior: Clip.none,
                                                    children: [
                                                      Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Container(
                                                            width: 99,
                                                            height: 99,
                                                            child: Image.network(
                                                              "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/6rbbg2t5_expires_30_days.png",
                                                              fit: BoxFit.fill,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                      Positioned(
                                                        bottom: 0,
                                                        left: 21,
                                                        width: 112,
                                                        height: 77,
                                                        child: Container(
                                                          decoration: BoxDecoration(
                                                            borderRadius:
                                                                BorderRadius.circular(
                                                                  45,
                                                                ),
                                                            color: Color(
                                                              0xFFFFFFFF,
                                                            ),
                                                          ),
                                                          transform:
                                                              Matrix4.translationValues(
                                                                0,
                                                                54,
                                                                0,
                                                              ),
                                                          width: 112,
                                                          height: 77,
                                                          child: SizedBox(),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Container(
                                              margin: const EdgeInsets.only(
                                                left: 125,
                                              ),
                                              width: 99,
                                              height: 99,
                                              child: Image.network(
                                                "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/ipjheo4k_expires_30_days.png",
                                                fit: BoxFit.fill,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  IntrinsicHeight(
                                    child: Container(
                                      margin: const EdgeInsets.only(
                                        bottom: 36,
                                        left: 36,
                                        right: 36,
                                      ),
                                      width: double.infinity,
                                      child: Column(
                                        children: [
                                          Container(
                                            margin: const EdgeInsets.only(
                                              bottom: 12,
                                            ),
                                            child: Text(
                                              "A good headline",
                                              style: TextStyle(
                                                color: Color(0xFF965541),
                                                fontSize: 36,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          IntrinsicHeight(
                                            child: Container(
                                              width: double.infinity,
                                              child: Column(
                                                children: [
                                                  Container(
                                                    width: 209,
                                                    child: Text(
                                                      "A simple app introduction \ngreeting audience.",
                                                      style: TextStyle(
                                                        color: Color(
                                                          0xFF000000,
                                                        ),
                                                        fontSize: 18,
                                                      ),
                                                      textAlign:
                                                          TextAlign.center,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  InkWell(
                                    onTap: () {
                                      print('Pressed');
                                    },
                                    child: IntrinsicWidth(
                                      child: IntrinsicHeight(
                                        child: Container(
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                            color: Color(0xFF1E1E1E),
                                          ),
                                          padding: const EdgeInsets.only(
                                            top: 17,
                                            bottom: 17,
                                            left: 107,
                                            right: 107,
                                          ),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "Log in",
                                                style: TextStyle(
                                                  color: Color(0xFFFFFFFF),
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
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
