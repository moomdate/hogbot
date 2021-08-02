import {load} from 'ts-dotenv';

export const env = load({
        end_point: {
            type: String,
            default: 'https://api-z.happy-hog.in.th'
        },
        facebook_token: String,
        buy_amount: {
            type: Number,
            default: 1
        },
        cron: {
            type: String,
            default: '* * * * *'
        },
        growUpItem: {
            type: Boolean,
            default: false
        },
        processed: {
            type: Boolean,
            default: false
        },
        raise: {
            type: Boolean,
            default: true
        },
        weightToProcess: {
            type: Number,
            default: 200
        },
        calve: {
            type: Boolean,
            default: false
        }
    }
);
