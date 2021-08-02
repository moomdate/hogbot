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

```shell
facebook_token=facebook token
buy_amount=จำนวนไอเท็มที่จะซื้อ
cron=cron default 1 นาที '* * * * *'
```
