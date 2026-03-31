import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post/post.entity';
import { User } from '../user/user.entity';

/**
 * Video CDN sources — đã xác nhận hoạt động (HTTP 200), không cần auth.
 * Kết hợp Cloudinary demo + test-videos.co.uk + samplelib.com
 *
 * ⚠ Google CDN (commondatastorage) bị chặn 403 → đã thay thế toàn bộ.
 */
const CLIPS = [
  // Cloudinary demo clips (6 clip — ổn định, CDN toàn cầu)
  'https://res.cloudinary.com/demo/video/upload/samples/sea-turtle.mp4',
  'https://res.cloudinary.com/demo/video/upload/samples/elephants.mp4',
  'https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4',
  'https://res.cloudinary.com/demo/video/upload/dog.mp4',
  'https://res.cloudinary.com/demo/video/upload/docs/walking_talking.mp4',
  'https://res.cloudinary.com/demo/video/upload/kitten_fighting.mp4',
  // test-videos.co.uk (3 clip — nhẹ, nhanh)
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  // samplelib.com (1 clip bổ sung)
  'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
];
const v = (i: number) => CLIPS[i % CLIPS.length];

/**
 * 100 video seed đa dạng — phân bổ thể loại:
 * funny(12), game(12), music(10), dance(8), education(8), tech(8),
 * travel(8), food(8), sport(6), beauty(6), pet(5), art(4), drama(5)
 *
 * Mỗi video có caption + tags riêng biệt → thuật toán cosine similarity
 * sẽ tạo ra feed KHÁC NHAU cho mỗi user dựa trên hành vi thực.
 */
const VIDEO_SEEDS = [
  // ====== FUNNY (12) ======
  { caption: 'Haha quá hài 😂😂 #funny #comedy #haha', tags: ['funny', 'comedy'], media: v(0) },
  { caption: 'Meme cười xỉu 🤣 #funny #meme #lol', tags: ['funny'], media: v(1) },
  { caption: 'Troll bạn bè quá đỉnh 😆 #funny #troll #comedy', tags: ['funny', 'comedy'], media: v(2) },
  { caption: 'Khoảnh khắc hài hước nhất 😂 #funny #fun #cười', tags: ['funny'], media: v(3) },
  { caption: 'Comedy skit cực hay 🎭 #comedy #funny #haha', tags: ['funny', 'comedy'], media: v(4) },
  { caption: 'Reaction hài hước 😹 #funny #reaction #meme', tags: ['funny'], media: v(5) },
  { caption: 'Fails compilation 2024 🤦 #funny #fails #comedy', tags: ['funny', 'comedy'], media: v(6) },
  { caption: 'Stand-up comedy hay nhất 🎤 #comedy #funny #standup', tags: ['funny', 'comedy'], media: v(7) },
  { caption: 'Khi bạn thân troll bạn 😜 #funny #bestfriend #haha', tags: ['funny'], media: v(8) },
  { caption: 'Thú cưng hài hước 🐱😂 #funny #pet #cute', tags: ['funny', 'pet'], media: v(9) },
  { caption: 'Khi mẹ phát hiện bạn chơi game 😂 #funny #family #haha', tags: ['funny'], media: v(0) },
  { caption: 'Tổng hợp clip hài triệu view 🤣 #funny #viral #trending', tags: ['funny'], media: v(1) },

  // ====== GAME (12) ======
  { caption: 'Gameplay Valorant rank cao 🎮 #game #valorant #gaming', tags: ['game'], media: v(2) },
  { caption: 'PUBG Mobile clutch 1v4 🔥 #game #pubg #esport', tags: ['game'], media: v(3) },
  { caption: 'GTA 6 First Look 🚗 #game #gta6 #gaming', tags: ['game'], media: v(4) },
  { caption: 'Minecraft build đỉnh cao 🏰 #game #minecraft #creative', tags: ['game', 'art'], media: v(5) },
  { caption: 'League of Legends Pentakill 💀 #game #lol #esport', tags: ['game'], media: v(6) },
  { caption: 'Game kinh dị mới hay quá 👻 #game #horror #gameplay', tags: ['game'], media: v(7) },
  { caption: 'FIFA highlight siêu phẩm ⚽ #game #fifa #football', tags: ['game', 'sport'], media: v(8) },
  { caption: 'Mobile game mới hay nhất 📱 #game #mobilegame #review', tags: ['game', 'tech'], media: v(9) },
  { caption: 'Top 5 game miễn phí không thể bỏ qua 🎮 #game #free #topgame', tags: ['game'], media: v(0) },
  { caption: 'Genshin Impact boss fight cực đỉnh ⚔️ #game #genshin #gaming', tags: ['game'], media: v(1) },
  { caption: 'Roblox tự tạo game đơn giản 🧱 #game #roblox #creative', tags: ['game', 'education'], media: v(2) },
  { caption: 'Call of Duty Warzone win ngay trận đầu 🏆 #game #cod #fps', tags: ['game'], media: v(3) },

  // ====== MUSIC (10) ======
  { caption: 'Cover nhạc chill buổi tối 🎵 #music #cover #sing', tags: ['music'], media: v(4) },
  { caption: 'Remix EDM cực phê 🎧 #music #remix #edm #beat', tags: ['music'], media: v(5) },
  { caption: 'Guitar fingerstyle cảm xúc 🎸 #music #guitar #melody', tags: ['music'], media: v(6) },
  { caption: 'Beat rap tự sáng tác 🎤 #music #rap #beat #hiphop', tags: ['music'], media: v(7) },
  { caption: 'Piano cover bài hát trending 🎹 #music #piano #cover', tags: ['music'], media: v(8) },
  { caption: 'Acoustic version tuyệt vời 🎶 #music #acoustic #sing', tags: ['music'], media: v(9) },
  { caption: 'Nhạc lofi chill study 📚🎵 #music #lofi #study #chill', tags: ['music', 'education'], media: v(0) },
  { caption: 'Mashup bài hit 2024 hay quá 🔥 #music #mashup #trending', tags: ['music'], media: v(1) },
  { caption: 'Vocal cover cảm xúc quá 🥺 #music #vocal #sing #cover', tags: ['music'], media: v(2) },
  { caption: 'DJ mix cuối tuần sôi động 🎧 #music #dj #mix #edm', tags: ['music'], media: v(3) },

  // ====== DANCE (8) ======
  { caption: 'Dance challenge mới nè 💃 #dance #tiktok #challenge', tags: ['dance', 'music'], media: v(4) },
  { caption: 'Choreography K-pop cực đỉnh 🕺 #dance #kpop #choreo', tags: ['dance'], media: v(5) },
  { caption: 'Nhảy shuffle dance siêu mượt 🔥 #dance #shuffle', tags: ['dance'], media: v(6) },
  { caption: 'Popping dance freestyle tuyệt vời 🤖 #dance #popping #freestyle', tags: ['dance'], media: v(7) },
  { caption: 'Dance cover nhóm 4 người 💃🕺 #dance #group #cover', tags: ['dance', 'music'], media: v(8) },
  { caption: 'Hip hop choreography cực chất 🔥 #dance #hiphop #choreo', tags: ['dance'], media: v(9) },
  { caption: 'Nhảy contemporary cảm xúc 🌙 #dance #contemporary #art', tags: ['dance', 'art'], media: v(0) },
  { caption: 'Locking dance battle siêu hay 🔒 #dance #locking #battle', tags: ['dance'], media: v(1) },

  // ====== EDUCATION (8) ======
  { caption: 'Học JavaScript trong 5 phút 💻 #education #learn #coding #tech', tags: ['education', 'tech'], media: v(2) },
  { caption: 'Tips học hiệu quả cho sinh viên 📚 #education #study #tips', tags: ['education'], media: v(3) },
  { caption: 'Kiến thức lập trình cơ bản 🧠 #education #coding #code', tags: ['education', 'tech'], media: v(4) },
  { caption: 'Cách học tiếng Anh nhanh nhất 🇬🇧 #education #english #learn', tags: ['education'], media: v(5) },
  { caption: 'Toán học thú vị bạn chưa biết 🔢 #education #math #fun', tags: ['education'], media: v(6) },
  { caption: 'Lịch sử Việt Nam 5 phút ⏰ #education #history #vietnam', tags: ['education'], media: v(7) },
  { caption: 'Bí quyết đạt điểm cao 📝 #education #tips #exam #study', tags: ['education'], media: v(8) },
  { caption: 'Python cho người mới bắt đầu 🐍 #education #python #coding', tags: ['education', 'tech'], media: v(9) },

  // ====== TECH (8) ======
  { caption: 'AI thay đổi thế giới thế nào? 🤖 #tech #ai #technology', tags: ['tech'], media: v(0) },
  { caption: 'Review iPhone 16 Pro Max 📱 #tech #review #smartphone', tags: ['tech'], media: v(1) },
  { caption: 'Setup bàn làm việc tối giản ✨ #tech #setup #minimal', tags: ['tech'], media: v(2) },
  { caption: '5 App hay nhất 2024 📲 #tech #apps #review #smartphone', tags: ['tech'], media: v(3) },
  { caption: 'So sánh Galaxy S25 vs iPhone 16 📊 #tech #compare #smartphone', tags: ['tech'], media: v(4) },
  { caption: 'Build PC gaming 30 triệu 💻 #tech #pc #gaming #build', tags: ['tech', 'game'], media: v(5) },
  { caption: 'Robot AI tự nấu ăn 🤖🍳 #tech #ai #robot #future', tags: ['tech'], media: v(6) },
  { caption: 'Unboxing MacBook M4 Pro 📦 #tech #unboxing #macbook #apple', tags: ['tech'], media: v(7) },

  // ====== TRAVEL (8) ======
  { caption: 'Phú Quốc đẹp quá trời 🏖️ #travel #phuquoc #beach #dulịch', tags: ['travel', 'nature'], media: v(8) },
  { caption: 'Đà Lạt sương mù lãng mạn 🌿 #travel #dalat #nature', tags: ['travel', 'nature'], media: v(9) },
  { caption: 'Khám phá Nhật Bản mùa hoa anh đào 🌸 #travel #japan #explore', tags: ['travel'], media: v(0) },
  { caption: 'Sunset tuyệt đẹp ở biển 🌅 #nature #sunset #beach', tags: ['nature', 'travel'], media: v(1) },
  { caption: 'Trekking Sapa mùa lúa chín 🌾 #travel #sapa #adventure', tags: ['travel', 'nature'], media: v(2) },
  { caption: 'Hội An phố cổ đêm lung linh 🏮 #travel #hoian #vietnam', tags: ['travel'], media: v(3) },
  { caption: 'Đi Thái Lan tự túc 7 ngày 🇹🇭 #travel #thailand #backpack', tags: ['travel'], media: v(4) },
  { caption: 'Bali Indonesia thiên đường du lịch 🌴 #travel #bali #paradise', tags: ['travel', 'nature'], media: v(5) },

  // ====== FOOD (8) ======
  { caption: 'Nấu phở bò chuẩn vị Hà Nội 🍜 #food #cooking #phở #ẩmthực', tags: ['food'], media: v(6) },
  { caption: 'Làm bánh mì thịt nướng tại nhà 🥖 #food #recipe #cooking', tags: ['food'], media: v(7) },
  { caption: 'Review quán ăn ngon Sài Gòn 🍕 #food #review #đồăn', tags: ['food'], media: v(8) },
  { caption: 'Ăn thử đồ ăn Hàn Quốc đầu tiên 🇰🇷 #food #korean #yummy', tags: ['food'], media: v(9) },
  { caption: 'Street food Việt Nam phải thử 🍢 #food #streetfood #vietnam', tags: ['food'], media: v(0) },
  { caption: 'Làm sushi tại nhà cực dễ 🍣 #food #sushi #cooking #japan', tags: ['food'], media: v(1) },
  { caption: 'Trà sữa tự pha ngon hơn quán 🧋 #food #boba #recipe #drink', tags: ['food'], media: v(2) },
  { caption: 'Cách làm pizza homemade 🍕 #food #pizza #recipe #yummy', tags: ['food'], media: v(3) },

  // ====== SPORT (6) ======
  { caption: 'Workout tại nhà 15 phút 💪 #sport #gym #fitness #workout', tags: ['sport'], media: v(4) },
  { caption: 'Highlight bóng đá hay nhất tuần ⚽ #sport #football #bóngđá', tags: ['sport'], media: v(5) },
  { caption: 'Yoga buổi sáng thư giãn 🧘 #sport #yoga #fitness', tags: ['sport'], media: v(6) },
  { caption: 'Boxing training cực chất 🥊 #sport #boxing #gym', tags: ['sport'], media: v(7) },
  { caption: 'Running tips cho người mới 🏃 #sport #running #tips #fitness', tags: ['sport'], media: v(8) },
  { caption: 'Basketball highlight NBA cực hay 🏀 #sport #nba #basketball', tags: ['sport'], media: v(9) },

  // ====== BEAUTY & FASHION (6) ======
  { caption: 'Makeup look đi chơi cuối tuần 💄 #beauty #makeup #trangđiểm', tags: ['beauty', 'fashion'], media: v(0) },
  { caption: 'OOTD mùa hè siêu đẹp 👗 #fashion #ootd #style #outfit', tags: ['fashion'], media: v(1) },
  { caption: 'Skincare routine buổi tối ✨ #beauty #skincare #mỹphẩm', tags: ['beauty'], media: v(2) },
  { caption: 'Phối đồ cực chất chỉ 200k 💰 #fashion #outfit #style', tags: ['fashion'], media: v(3) },
  { caption: 'Tóc đẹp cho mùa hè 2024 💇‍♀️ #beauty #hair #hairstyle', tags: ['beauty'], media: v(4) },
  { caption: 'Thử 10 son môi dưới 100k 💋 #beauty #lipstick #review', tags: ['beauty', 'fashion'], media: v(5) },

  // ====== PET (5) ======
  { caption: 'Mèo con dễ thương quá 😻 #pet #cat #cute #meow', tags: ['pet'], media: v(6) },
  { caption: 'Chó Golden siêu đáng yêu 🐕 #pet #dog #golden #cute', tags: ['pet'], media: v(7) },
  { caption: 'Nuôi hamster lần đầu 🐹 #pet #hamster #cute #animal', tags: ['pet'], media: v(8) },
  { caption: 'Mèo vs máy hút bụi 🐱💨 #pet #cat #funny #haha', tags: ['pet', 'funny'], media: v(9) },
  { caption: 'Chó Husky drama queen 🐺😂 #pet #husky #dog #funny', tags: ['pet', 'funny'], media: v(0) },

  // ====== ART (4) ======
  { caption: 'Vẽ tranh digital art tuyệt đẹp 🎨 #art #draw #digital', tags: ['art'], media: v(1) },
  { caption: 'Calligraphy thư pháp hiện đại ✍️ #art #calligraphy #design', tags: ['art'], media: v(2) },
  { caption: 'Timelapse vẽ chân dung 🖌️ #art #portrait #timelapse', tags: ['art'], media: v(3) },
  { caption: 'DIY room decor aesthetic 🏠 #art #diy #decor #aesthetic', tags: ['art', 'diy'], media: v(4) },

  // ====== DRAMA & MOVIE (5) ======
  { caption: 'Review phim hay Netflix tháng này 🎬 #drama #movie #netflix #review', tags: ['drama'], media: v(5) },
  { caption: 'Top 5 anime hay nhất 2024 🇯🇵 #drama #anime #manga #otaku', tags: ['drama'], media: v(6) },
  { caption: 'Kdrama mới quá hay 🇰🇷😍 #drama #kdrama #korean', tags: ['drama'], media: v(7) },
  { caption: 'Phim kinh dị hay sợ luôn 👻 #drama #horror #movie', tags: ['drama'], media: v(8) },
  { caption: 'Marvel vs DC: Ai thắng? 🦸 #drama #marvel #dc #superhero', tags: ['drama'], media: v(9) },
];

@Injectable()
export class VideoSeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const existingVideos = await this.postRepo.count({ where: { type: 'video' } });
    if (existingVideos >= 100) {
      console.log(`📹 [Seeder] Đã có ${existingVideos} video, bỏ qua seed.`);
      return;
    }

    // Lấy tất cả users để phân bổ video cho nhiều user (đa dạng hơn cho thuật toán)
    const users = await this.userRepo.find({ take: 10 });
    let creators = users;

    if (creators.length === 0) {
      console.log('⚠️ [Seeder] Không có user nào, tạo user demo...');
      const demoUsers = [
        { username: 'video_creator', email: 'creator@demo.com', displayName: 'Video Creator', avatar: 'https://i.pravatar.cc/150?img=1' },
        { username: 'content_star', email: 'star@demo.com', displayName: 'Content Star', avatar: 'https://i.pravatar.cc/150?img=2' },
        { username: 'daily_vlog', email: 'vlog@demo.com', displayName: 'Daily Vlog', avatar: 'https://i.pravatar.cc/150?img=3' },
      ];
      creators = [];
      for (const u of demoUsers) {
        const newUser = this.userRepo.create({
          ...u,
          passwordHash: '$2b$10$dummyhashvalue',
        } as any);
        const saved = await this.userRepo.save(newUser);
        creators.push(saved as unknown as User);
      }
    }

    console.log(`🌱 [Seeder] Đang insert ${VIDEO_SEEDS.length} video shorts (đã có ${existingVideos})...`);

    let count = 0;
    for (let i = 0; i < VIDEO_SEEDS.length; i++) {
      const seed = VIDEO_SEEDS[i];
      const exists = await this.postRepo.findOne({
        where: { caption: seed.caption, type: 'video' },
      });
      if (exists) continue;

      // Phân bổ video cho nhiều user khác nhau
      const creator = creators[i % creators.length];

      const post = this.postRepo.create({
        userId: creator.id,
        caption: seed.caption,
        type: 'video' as const,
        media: [seed.media],
        tags: seed.tags,
        likesCount: Math.floor(Math.random() * 2000),
        commentsCount: Math.floor(Math.random() * 300),
        viewsCount: Math.floor(Math.random() * 50000) + 500,
        sharesCount: Math.floor(Math.random() * 200),
        avgCompletionRate: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
      });

      await this.postRepo.save(post);
      count++;
    }

    console.log(`✅ [Seeder] Đã insert ${count} video shorts! Tổng: ${existingVideos + count} video.`);
    console.log(`📊 [Seeder] Phân bổ: funny(12), game(12), music(10), dance(8), education(8), tech(8), travel(8), food(8), sport(6), beauty(6), pet(5), art(4), drama(5)`);
  }
}
