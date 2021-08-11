export class HogData {
    public static readonly FOOD_BURGER_ID = 0;
    public static readonly FOOD_MILK_ID = 1;
    public static readonly FOOD_ICE_CREAM_ID = 1;
    public static readonly FOOD_LETTUCE_ID = 3;  //ผักกาด
    public static readonly FOOD_SALAD_ID = 4;

    public static readonly RENG_POWER = 10; // เร่งพลัง
    public static readonly RENG_CROD = 11; // เร่งคลอด
    public static readonly RENG_TO = 26; // เร่่งโต
    public static readonly FOOD_SUPPLEMENT = 27; // อาหารเสริม
    public static readonly BACK_PEPPER = 16; // เริกไทย
    public static readonly JUJUBE = 18; // พุทราจีน
    public static readonly SALT = 19; // เกลือ
    public static readonly SPICES = 23; // เครื่องเทศ
    public static readonly SUI = 22; // ซีอิ้ว
    public static readonly DIVERSE = 15; // พะโล้


    public static farmMaxSize(farmLevel: number): number {
        return {
            1: 6,
            2: 12,
            3: 18,
            4: 24,
            5: 30,
            6: 36
        }[farmLevel] || 0
    }

    public static factoryMaxSize(processLevel: number): number {
        return {
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: 6
        }[processLevel] || 0
    }
}
