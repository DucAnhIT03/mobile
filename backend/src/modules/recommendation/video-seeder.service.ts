import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post/post.entity';
import { User } from '../user/user.entity';

/**
 * 5 clip ngắn (~13-15s) từ Google CDN — luôn hoạt động, không cần auth
 * Thuật toán đề xuất chạy dựa trên TAGS/CAPTION, không phải nội dung video
 */
const CLIPS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
];
const v = (i: number) => CLIPS[i % CLIPS.length];

const VIDEO_SEEDS = [
  // ====== FUNNY (10) ======
  { caption: 'Haha quá hài 😂😂 #funny #comedy #haha', tags: ['funny', 'comedy'], media: v(0) },
  { caption: 'Meme cười xỉu 🤣 #funny #meme #lol', tags: ['funny'], media: v(1) },
  { caption: 'Troll bạn bè quá đỉnh 😆 #funny #troll #comedy', tags: ['funny', 'comedy'], media: v(2) },
  { caption: 'Khoảnh khắc hài hước nhất 😂 #funny #fun #cười', tags: ['funny'], media: v(3) },
  { caption: 'Comedy skit cực hay 🎭 #comedy #funny #haha', tags: ['funny', 'comedy'], media: v(4) },
  { caption: 'Reaction hài hước 😹 #funny #reaction #meme', tags: ['funny'], media: v(0) },
  { caption: 'Fails compilation 2024 🤦 #funny #fails #comedy', tags: ['funny', 'comedy'], media: v(1) },
  { caption: 'Stand-up comedy hay nhất 🎤 #comedy #funny #standup', tags: ['funny', 'comedy'], media: v(2) },
  { caption: 'Khi bạn thân troll bạn 😜 #funny #bestfriend #haha', tags: ['funny'], media: v(3) },
  { caption: 'Thú cưng hài hước 🐱😂 #funny #pet #cute', tags: ['funny', 'pet'], media: v(4) },

  // ====== GAME (8) ======
  { caption: 'Gameplay Valorant rank cao 🎮 #game #valorant #gaming', tags: ['game'], media: v(0) },
  { caption: 'PUBG Mobile clutch 1v4 🔥 #game #pubg #esport', tags: ['game'], media: v(1) },
  { caption: 'GTA 6 First Look 🚗 #game #gta6 #gaming', tags: ['game'], media: v(2) },
  { caption: 'Minecraft build đỉnh cao 🏰 #game #minecraft #creative', tags: ['game', 'art'], media: v(3) },
  { caption: 'League of Legends Pentakill 💀 #game #lol #esport', tags: ['game'], media: v(4) },
  { caption: 'Game kinh dị mới hay quá 👻 #game #horror #gameplay', tags: ['game'], media: v(0) },
  { caption: 'FIFA highlight siêu phẩm ⚽ #game #fifa #football', tags: ['game', 'sport'], media: v(1) },
  { caption: 'Mobile game mới hay nhất 📱 #game #mobilegame #review', tags: ['game', 'tech'], media: v(2) },

  // ====== MUSIC & DANCE (7) ======
  { caption: 'Cover nhạc chill buổi tối 🎵 #music #cover #sing', tags: ['music'], media: v(3) },
  { caption: 'Remix EDM cực phê 🎧 #music #remix #edm #beat', tags: ['music'], media: v(4) },
  { caption: 'Dance challenge mới nè 💃 #dance #tiktok #challenge', tags: ['dance', 'music'], media: v(0) },
  { caption: 'Guitar fingerstyle cảm xúc 🎸 #music #guitar #melody', tags: ['music'], media: v(1) },
  { caption: 'Choreography K-pop cực đỉnh 🕺 #dance #kpop #choreo', tags: ['dance'], media: v(2) },
  { caption: 'Beat rap tự sáng tác 🎤 #music #rap #beat #hiphop', tags: ['music'], media: v(3) },
  { caption: 'Nhảy shuffle dance siêu mượt 🔥 #dance #shuffle', tags: ['dance'], media: v(4) },

  // ====== EDUCATION & TECH (7) ======
  { caption: 'Học JavaScript trong 5 phút 💻 #education #learn #coding #tech', tags: ['education', 'tech'], media: v(0) },
  { caption: 'AI thay đổi thế giới thế nào? 🤖 #tech #ai #technology', tags: ['tech'], media: v(1) },
  { caption: 'Tips học hiệu quả cho sinh viên 📚 #education #study #tips', tags: ['education'], media: v(2) },
  { caption: 'Review iPhone 16 Pro Max 📱 #tech #review #smartphone', tags: ['tech'], media: v(3) },
  { caption: 'Kiến thức lập trình cơ bản 🧠 #education #coding #code', tags: ['education', 'tech'], media: v(4) },
  { caption: 'Setup bàn làm việc tối giản ✨ #tech #setup #minimal', tags: ['tech'], media: v(0) },
  { caption: '5 App hay nhất 2024 📲 #tech #apps #review #smartphone', tags: ['tech'], media: v(1) },

  // ====== TRAVEL & NATURE (5) ======
  { caption: 'Phú Quốc đẹp quá trời 🏖️ #travel #phuquoc #beach #dulịch', tags: ['travel', 'nature'], media: v(2) },
  { caption: 'Đà Lạt sương mù lãng mạn 🌿 #travel #dalat #nature', tags: ['travel', 'nature'], media: v(3) },
  { caption: 'Khám phá Nhật Bản mùa hoa anh đào 🌸 #travel #japan #explore', tags: ['travel'], media: v(4) },
  { caption: 'Sunset tuyệt đẹp ở biển 🌅 #nature #sunset #beach', tags: ['nature', 'travel'], media: v(0) },
  { caption: 'Trekking Sapa mùa lúa chín 🌾 #travel #sapa #adventure', tags: ['travel', 'nature'], media: v(1) },

  // ====== FOOD (5) ======
  { caption: 'Nấu phở bò chuẩn vị Hà Nội 🍜 #food #cooking #phở #ẩmthực', tags: ['food'], media: v(2) },
  { caption: 'Làm bánh mì thịt nướng tại nhà 🥖 #food #recipe #cooking', tags: ['food'], media: v(3) },
  { caption: 'Review quán ăn ngon Sài Gòn 🍕 #food #review #đồăn', tags: ['food'], media: v(4) },
  { caption: 'Ăn thử đồ ăn Hàn Quốc đầu tiên 🇰🇷 #food #korean #yummy', tags: ['food'], media: v(0) },
  { caption: 'Street food Việt Nam phải thử 🍢 #food #streetfood #vietnam', tags: ['food'], media: v(1) },

  // ====== SPORT & FITNESS (4) ======
  { caption: 'Workout tại nhà 15 phút 💪 #sport #gym #fitness #workout', tags: ['sport'], media: v(2) },
  { caption: 'Highlight bóng đá hay nhất tuần ⚽ #sport #football #bóngđá', tags: ['sport'], media: v(3) },
  { caption: 'Yoga buổi sáng thư giãn 🧘 #sport #yoga #fitness', tags: ['sport'], media: v(4) },
  { caption: 'Boxing training cực chất 🥊 #sport #boxing #gym', tags: ['sport'], media: v(0) },

  // ====== BEAUTY & FASHION (4) ======
  { caption: 'Makeup look đi chơi cuối tuần 💄 #beauty #makeup #trangđiểm', tags: ['beauty', 'fashion'], media: v(1) },
  { caption: 'OOTD mùa hè siêu đẹp 👗 #fashion #ootd #style #outfit', tags: ['fashion'], media: v(2) },
  { caption: 'Skincare routine buổi tối ✨ #beauty #skincare #mỹphẩm', tags: ['beauty'], media: v(3) },
  { caption: 'Phối đồ cực chất chỉ 200k 💰 #fashion #outfit #style', tags: ['fashion'], media: v(4) },
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
    if (existingVideos >= 50) {
      console.log('📹 [Seeder] Đã có đủ 50+ video, bỏ qua seed.');
      return;
    }

    let user = await this.userRepo.findOne({ where: {} });
    if (!user) {
      console.log('⚠️ [Seeder] Không có user nào, tạo user demo...');
      const newUser = this.userRepo.create({
        username: 'video_creator',
        email: 'creator@demo.com',
        passwordHash: '$2b$10$dummyhashvalue',
        displayName: 'Video Creator',
        avatar: 'https://i.pravatar.cc/150?img=1',
      } as any);
      user = await this.userRepo.save(newUser) as unknown as User;
    }

    console.log(`🌱 [Seeder] Đang insert ${VIDEO_SEEDS.length} video shorts...`);

    let count = 0;
    for (const seed of VIDEO_SEEDS) {
      const exists = await this.postRepo.findOne({
        where: { caption: seed.caption, type: 'video' },
      });
      if (exists) continue;

      const post = this.postRepo.create({
        userId: user!.id,
        caption: seed.caption,
        type: 'video' as const,
        media: [seed.media],
        tags: seed.tags,
        likesCount: Math.floor(Math.random() * 500),
        commentsCount: Math.floor(Math.random() * 100),
        viewsCount: Math.floor(Math.random() * 5000) + 100,
        sharesCount: Math.floor(Math.random() * 50),
        avgCompletionRate: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
      });

      await this.postRepo.save(post);
      count++;
    }

    console.log(`✅ [Seeder] Đã insert ${count} video shorts vào database!`);
  }
}
