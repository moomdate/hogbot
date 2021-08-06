## STEPS

#### 1 build

`docker build . -t hogbot-img`

#### 2 run

`docker run --env-file="/home/name/bot-env/.env" -d --rm --name hogbot hogbot-img`

### or

`docker build . -t hogbot-img && docker run --env-file="/home/pi/bot1-env/.env" -d --rm --name hogbot1 hogbot-img --restart=always`

### Feature

- ให้อาหาร
- อาบน้ำ
- ซื้อเบอร์เกอร์
- เก็บเหรียญ
- แปรรูปหมูเมื่อน้ำหนักถึงเกณฑ์ ยกเว้นหมูแรร์
- ซื้อไอเท็มแปรรูป
- รับไอเท็มประจำวัน

## How to config `.env` file

| variable        | require  | default    | description                                     |   |
|-----------------|----------|------------|-------------------------------------------------|---|
| facebook_token  | &#x2611; | undefined  | facebook token                                  |   |
| cron            | &#x2612; | * * * * *  | ตั้งเวลารัน                                        |   |
| processed       | &#x2612; | false      | แปรรูปหมูอัติโนมัติ เหมือน้ำหนักถึงเกณฑ์ที่ตั้งไว้ (ยกเว้นหมูแรร์) |   |
| raise           | &#x2612; | true       | เลี้ยงหมูอัตโนมัติ (ให้อาหาร, ให้น้ำ, อาบน้ำ, เก็บเหรียญ)   |   |
| weightToProcess | &#x2612; | 200        | นำ้หนักหมูพร้อมแปรรูป                                |   |
