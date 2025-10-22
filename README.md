# Plant-Manager

<div align="center">
  <img src="PlantMonitorLogo.png" style="width: 20%"/>
</div>


## Projektidee
Eine Pflanze soll automatisiert bewässert und überwacht werden. Sollte der Feuchtigkeitssensor einen gewissen Schwellwert überschreiten, wird die Tauchpumpe in Gang gesetzt und bewässert die Pflanze mit einer festen Menge Wasser.
Parallel werden die Daten des Feuchtigkeitssensors gesammelt und gespeichert.
In festgelegten Zeitabständen wird mit einer externen Kamera Aufnahmen von der Pflanze gemacht. Die gesammelten Bilder für jeden Tag zu einem Zeitraffer zusammengefügt.
Das erstellte Video wird schlussendlich über die Youtube API hochgeladen.


### Materialliste
- [x] Raspberry Pi
- [ ] Kamera (evtl esp32 cam, oder RapsberryPi cam)
  - [Ali](https://de.aliexpress.com/item/32898060645.html?spm=a2g0o.productlist.main.1.2aa54767FUX1bP&algo_pvid=116149b7-a284-4a26-8a23-a639a487b87d&algo_exp_id=116149b7-a284-4a26-8a23-a639a487b87d-0&pdp_ext_f=%7B%22order%22%3A%228%22%2C%22eval%22%3A%221%22%2C%22fromPage%22%3A%22search%22%7D&pdp_npi=6%40dis%21EUR%2114.85%2110.69%21%21%2116.83%2112.11%21%40211b615317611267083886426ebc2f%2165797877692%21sea%21DE%210%21ABX%211%210%21n_tag%3A-29910%3Bd%3A639db27c%3Bm03_new_user%3A-29895&curPageLogUid=UzW4drQITyq5&utparam-url=scene%3Asearch%7Cquery_from%3A%7Cx_object_id%3A32898060645%7C_p_origin_prod%3A) 
- [ ] Feuchtigkeitssensor
  - [Adafruit](https://www.adafruit.com/product/4026)
- [ ] Tauchpumpe
  - [Amazon](https://www.amazon.de/RUNCCI-YUN-Wasserpumpe-Motorpumpe-Schlauch-Bew%C3%A4sserung/dp/B082PM8L6X?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1IZ40NQDKJE52&dib=eyJ2IjoiMSJ9.asLt2XxvrvR79r78qc3_FLwwUi9BLjmo1mcklVcR5Pm7jV54SJ5Q8A_Uwa1-ojuVHB93UNZoWehldmWD4kyAfsgsENusT-yR4vq07TEjAaJ5A3n6yvIb-_AiasZWGMW7YBO5GPY_sgQSpy5EVtkRpPV3m_wWCda1_BDKotpttHtOt99p6qFNpOQHKcIWSLKaI_fFul0YdjxLuI5Am7lCTCh2vLyFVot906HpcZlX7ZRpsuWmjD00CMDAYjGb2shZwqNLDYjdhsvlgCBTf4bHjj-XwVb01wC2d7eVZgUgRlQ.bKYC3zveW7ZnSlETCFvJh9o8mKRlQqQKbPfT_qtMZJA&dib_tag=se&keywords=tauchpumpe%2B5v%2Bwasser&qid=1761128003&sprefix=tauchpumpe%2B5v%2Bwasser%2Caps%2C85&sr=8-6&th=1)
- [ ] Schlauch
  - Bei Pumpe dabei
- [ ] Dripper (brauchen wir vllt nich)
- [x] Wasserbehälter (nehmen wir irgend ne flasche nobody cares
- [ ] Pflanze (baumarkt)
- [ ] Netzteil (hab ich glaub, vielleicht braucht die pumpe extra ein netzteil)
- [ ] Kamerastativ / Gehäuse (Wird outsourced an die PL 3D-Printing GmbH)
- [ ] Licht (Hat die Kamera an sich)
  - [Ansonsten Amazon](https://www.amazon.de/AZDelivery-MAX7219-Matrix-Anzeigemodul-Arduino/dp/B07CRF13ZQ?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1TMHUSM9RTWWJ&dib=eyJ2IjoiMSJ9.9t2XF8EZjkCsIa15JZC6R8RctUJOu0X04KrwVrR4Yw4P-X5g7xeNBy5LWe76wqSo6Ua8Fwb5alQP2pKMXtGfzLf9UnvG0YIZBm7Dvk1t3DcDTO2kJ-L2AgSdFMdMi18Hath5EP_pfn_1TDYGNtJ2MvvTCWRvOtDmQf_3i_tlB3YeJ77yH00UqNA8lxLU0KbLVdTZ7UJ2Ob8Xcsip-tKSlrNzr6uoCs3y2xVDlNZw-e4.UBhtLyRmsmcCsMpZEPe932PS6zMEP9ZR3Am09XghxQM&dib_tag=se&keywords=raspberry%2Bpi%2Bled%2Blight&qid=1761128481&sprefix=raspberry%2Bpi%2Bled%2Blight%2Caps%2C83&sr=8-2&th=1)
