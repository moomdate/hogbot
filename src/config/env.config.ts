import {load} from 'ts-dotenv';

export const env = load({
        end_point: String,
        facebook_token: String,
        user_id: String
    }
);
