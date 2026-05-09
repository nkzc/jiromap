-- Step 1: Revert id=3 to 歌舞伎町店 (was wrongly renamed to 小滝橋通り)
UPDATE shops SET
    name = 'ラーメン二郎 新宿歌舞伎町店',
    lat = 35.6940, lng = 139.7006,
    address = '東京都新宿区歌舞伎町',
    nearest_station = '西武新宿線 西武新宿駅 徒歩5分',
    business_hours = '11:30-26:30',
    closed_days = '水曜日'
WHERE id = 3;

-- Step 2: Fix store names
UPDATE shops SET name = 'ラーメン二郎 千住大橋駅前店' WHERE id = 14;
UPDATE shops SET name = 'ラーメン二郎 めじろ台店' WHERE id = 17;
UPDATE shops SET name = 'ラーメン二郎 中山駅前店' WHERE id = 19;

-- Step 3: Update business hours for existing shops (from jiro-matome.com)
UPDATE shops SET business_hours = '08:30-20:00', closed_days = '日曜日・祝日' WHERE id = 1;
UPDATE shops SET business_hours = '11:00-17:30', closed_days = '日曜日・祝日' WHERE id = 2;
UPDATE shops SET business_hours = '11:00-16:00, 18:00-22:00', closed_days = 'なし' WHERE id = 4;
UPDATE shops SET business_hours = '10:00-14:00, 17:00-21:00', closed_days = '日曜日・祝日' WHERE id = 5;
UPDATE shops SET business_hours = '10:30-14:00, 17:30-20:30', closed_days = '水曜日' WHERE id = 6;
UPDATE shops SET business_hours = '11:00-14:00, 17:30-21:00', closed_days = '火曜日・祝日' WHERE id = 7;
UPDATE shops SET business_hours = '17:00-22:00', closed_days = '土曜日・日曜日・祝日' WHERE id = 8;
UPDATE shops SET business_hours = '11:00-14:00, 17:30-21:00', closed_days = 'なし' WHERE id = 10;
UPDATE shops SET business_hours = '10:30-15:00', closed_days = '月曜日・日曜日・祝日' WHERE id = 11;
UPDATE shops SET business_hours = '11:30-14:30, 18:00-21:00', closed_days = '日曜日・祝日' WHERE id = 12;
UPDATE shops SET business_hours = '11:30-14:15, 18:00-21:45', closed_days = '日曜日・祝日' WHERE id = 13;
UPDATE shops SET business_hours = '10:30-15:30', closed_days = '木曜日・土曜日・日曜日・祝日' WHERE id = 14;
UPDATE shops SET business_hours = '11:00-15:00, 17:30-21:00', closed_days = '月曜日' WHERE id = 16;
UPDATE shops SET business_hours = '11:00-14:30, 17:30-20:30', closed_days = '木曜日・祝日' WHERE id = 17;
UPDATE shops SET business_hours = '11:00-14:30, 17:00-21:00', closed_days = '水曜日' WHERE id = 18;
UPDATE shops SET business_hours = '11:00-14:00, 18:00-21:30', closed_days = '木曜日' WHERE id = 19;
UPDATE shops SET business_hours = '11:00-14:00, 18:00-22:00', closed_days = '日曜日・祝日' WHERE id = 20;
UPDATE shops SET business_hours = '10:20-14:00, 17:00-20:30', closed_days = '月曜日・祝日' WHERE id = 21;
UPDATE shops SET business_hours = '11:00-14:00, 18:00-21:00', closed_days = '月曜日' WHERE id = 22;
UPDATE shops SET business_hours = '11:00-14:30, 17:00-21:30', closed_days = '日曜日・祝日' WHERE id = 23;
UPDATE shops SET business_hours = '11:00-15:00, 17:30-21:30', closed_days = '月曜日' WHERE id = 24;
UPDATE shops SET business_hours = '11:30-14:30, 17:00-21:00', closed_days = 'なし' WHERE id = 26;

-- Step 4: Insert new shops
INSERT INTO shops (name, lat, lng, address, nearest_station, category, business_hours, closed_days) VALUES
('ラーメン二郎 仙川店', 35.6497, 139.5894, '東京都調布市仙川', '京王線 仙川駅 徒歩3分', 'jiro', '17:00-21:00', '日曜日・祝日'),
('ラーメン二郎 環七新新代田店', 35.6565, 139.6485, '東京都世田谷区', '京王井の頭線 新代田駅 徒歩5分', 'jiro', '11:00-15:00', '月曜日・祝日'),
('ラーメン二郎 池袋東口店', 35.7311, 139.7136, '東京都豊島区東池袋', 'JR池袋駅 東口 徒歩5分', 'jiro', '10:30-16:30', '月曜日'),
('ラーメン二郎 松戸駅前店Ⅲ', 35.7878, 139.9026, '千葉県松戸市松戸', 'JR常磐線 松戸駅 徒歩3分', 'jiro', '17:30-21:30', '日曜日・祝日'),
('ラーメン二郎 上野毛店', 35.6198, 139.6383, '東京都世田谷区上野毛', '東急大井町線 上野毛駅 徒歩5分', 'jiro', '11:00-14:15, 18:00-22:00', '日曜日・祝日'),
('ラーメン二郎 京成大久保店', 35.7019, 140.0247, '千葉県習志野市', '京成本線 京成大久保駅 徒歩5分', 'jiro', '11:00-15:00', '日曜日・祝日'),
('ラーメン二郎 栃木街道店', 36.3830, 139.7278, '栃木県栃木市', 'JR両毛線 栃木駅 バス', 'jiro', '11:30-14:45, 18:00-21:00', '日曜日・祝日'),
('ラーメン二郎 立川店', 35.6977, 139.4133, '東京都立川市', 'JR中央線 立川駅 徒歩10分', 'jiro', '11:00-14:30, 17:30-20:30', '水曜日・祝日'),
('ラーメン二郎 湘南藤沢店', 35.3383, 139.4886, '神奈川県藤沢市', '小田急江ノ島線 藤沢本町駅 徒歩5分', 'jiro', '11:00-14:30, 17:00-21:00', '火曜日'),
('ラーメン二郎 西台駅前店', 35.7854, 139.6828, '東京都板橋区', '都営三田線 西台駅 徒歩1分', 'jiro', '11:00-13:30, 17:30-20:30', '日曜日・祝日'),
('ラーメン二郎 新宿小滝橋通り店', 35.6946, 139.6905, '東京都新宿区西新宿7丁目', '都営大江戸線 西新宿五丁目駅 徒歩5分', 'jiro', '11:00-22:00', 'なし'),
('ラーメン二郎 札幌店', 43.0686, 141.3508, '北海道札幌市', 'JR札幌駅 徒歩15分', 'jiro', '11:00-14:00, 17:00-20:30', '日曜日・祝日'),
('ラーメン二郎 会津若松駅前店', 37.4995, 139.9294, '福島県会津若松市', 'JR磐越西線 会津若松駅 徒歩5分', 'jiro', '11:00-14:00, 17:00-21:00', '月曜日・祝日'),
('ラーメン二郎 新潟店', 37.9163, 139.0364, '新潟県新潟市', 'JR新潟駅 バス', 'jiro', '11:00-14:00, 16:30-21:00', '月曜日・木曜日'),
('ラーメン二郎 京都店', 35.0220, 135.7480, '京都府京都市', '京都市内', 'jiro', '11:00-14:00, 18:00-21:30', '水曜日・祝日'),
('ラーメン二郎 越谷店', 35.8888, 139.7905, '埼玉県越谷市', '東武スカイツリーライン 越谷駅 徒歩5分', 'jiro', '11:30-19:00', '土曜日・日曜日'),
('ラーメン二郎 前橋千代田町店', 36.3897, 139.0627, '群馬県前橋市千代田町', 'JR両毛線 前橋駅 徒歩20分', 'jiro', '11:00-14:00, 17:00-20:00', '月曜日・月曜祝日'),
('ラーメン二郎 大宮公園駅前店', 35.9120, 139.6311, '埼玉県さいたま市大宮区', '東武野田線 大宮公園駅 徒歩1分', 'jiro', '11:30-14:30, 17:30-21:00', '水曜日'),
('ラーメン二郎 ひたちなか店', 36.3872, 140.5336, '茨城県ひたちなか市', 'JR常磐線 勝田駅 バス', 'jiro', '11:00-14:30, 17:30-21:00', '日曜日'),
('ラーメン二郎 一橋学園店', 35.7288, 139.4683, '東京都小平市', '西武多摩湖線 一橋学園駅 徒歩3分', 'jiro', '11:00-14:00, 17:30-20:30', '木曜日'),
('ラーメン二郎 生田店', 35.6014, 139.4988, '神奈川県川崎市多摩区', '小田急小田原線 生田駅 徒歩5分', 'jiro', '11:00-15:00, 18:00-21:00', '水曜日・祝日'),
('ラーメン二郎 朝倉街道駅前店', 33.4875, 130.5236, '福岡県筑紫野市', '西鉄天神大牟田線 朝倉街道駅 徒歩1分', 'jiro', '11:30-14:30, 17:30-20:30', '木曜日・祝日');
