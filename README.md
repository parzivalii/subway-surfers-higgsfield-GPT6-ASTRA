# 🏃‍♂️ Subway Surfers Astra (Switchyard Sprint) 🛹

> **یک بازی رانر سه‌بعدی جذاب، سریع و روان با الهام از ساب‌وی سرفرز (Subway Surfers)**  
> **An exciting, responsive, 3D endless railway runner built with TypeScript, Three.js, React 19 & Vite.**

---

### 🌐 زبان / Language Selection
- 🇮🇷 **[راهنمای کامل فارسی (پیش‌فرض)](#-راهنمای-فارسی-persian-guide)**
- 🇬🇧 **[English Complete Guide & Tutorial](#-english-guide--tutorial)**

---

<a name="persian-guide"></a>
# 🇮🇷 راهنمای فارسی (Persian Guide)

به بازی **Switchyard Sprint (Subway Surfers Astra)** خوش آمدید!  
این پروژه یک بازی مستقل، سه‌بعدی و بسیار سبک بر بستر وب است که بدون نیاز به نصب نرم‌افزارهای سنگین یا شبیه‌سازها، مستقیماً داخل مرورگر شما (کروم، فایرفاکس، اج و...) اجرا می‌شود. تمام امکانات گیم‌پلی محبوب ساب‌وی سرفرز شامل دویدن در ۳ لاین قطار، پرش، سر خوردن زیر موانع، اسکیت‌برد (Hoverboard)، آهنربای سکه، جت‌پک، کفش پرش، جمع‌آوری سکه و خرید کاراکترهای مختلف در آن پیاده‌سازی شده است.

---

## 📖 فهرست مطالب (بخش فارسی)
1. [ویژگی‌های کلیدی بازی](#ویژگیهای-کلیدی-بازی)
2. [آموزش نصب و اجرا برای افراد کاملاً مبتدی (قدم به قدم بدون نیاز به کدنویسی)](#آموزش-نصب-و-اجرا-برای-افراد-کاملا-مبتدی)
   - [روش ۱: اجرای فوق‌سریع با یک کلیک (مخصوص ویندوز)](#روش-۱-اجرای-فوقسریع-با-یک-کلیک-مخصوص-ویندوز)
   - [روش ۲: دانلود بدون نیاز به Git (فایل ZIP)](#روش-۲-دانلود-بدون-نیاز-به-git-فایل-zip)
   - [روش ۳: روش مرسوم و استاندارد با ترمینال (Terminal / CMD)](#روش-۳-روش-مرسوم-و-استاندارد-با-ترمینال)
3. [راهنمای کنترل‌ها و کلیدهای بازی](#راهنمای-کنترلها-و-کلیدهای-بازی)
4. [معرفی کاراکترها، اسکیت‌ها و آیتم‌ها](#معرفی-کاراکترها-اسکیتها-و-آیتمها)
5. [درجه‌های سختی بازی (Difficulty Modes)](#درجههای-سختی-بازی)
6. [حالت آفلاین و ذخیره‌سازی داده‌ها](#حالت-آفلاین-و-ذخیرهسازی-دادهها)
7. [رفع مشکلات رایج (Troubleshooting)](#رفع-مشکلات-رایج)
8. [اطلاعات ویژه برنامه‌نویسان و توسعه‌دهندگان](#اطلاعات-ویژه-برنامهنویسان)

---

### ✨ ویژگی‌های کلیدی بازی

- 🎮 **کنترل بی‌نهایت نرم و پاسخگو**: حرکت روان بین ۳ لاین، پرش، غلتیدن و فرود سریع در هوا.
- 🛹 **هاوربردهای اختصاصی (Hoverboard)**: دارای ۲ نوع اسکیت بورد جادویی با قابلیت نجات از تصادف و ویژگی‌های خاص پرش.
- 🧑‍🤝‍🧑 **۵ کاراکتر متنوع + ۱۰ استایل و لباس**: شامل کاراکترهای Pip، Jett، Nori، Rumi و Tavi همراه با لباس‌های دوم.
- ⚡ **۴ آیتم قدرتی (Power-ups)**:
  - 🧲 **آهنربا (Coin Magnet)**: جذب خودکار تمامی سکه‌های اطراف.
  - 🚀 **جت‌پک (Jetpack)**: پرواز به آسمان در مسیری امن و پر از سکه.
  - 👟 **کفش پرش (Super Jump)**: پرش‌های فوق‌العاده بلند برای عبور از روی سقف قطارها.
  - ✖️ **ضریب امتیاز (Score Multiplier)**: دو برابر کردن امتیازها حین دویدن.
- 🎯 **سیستم ماموریت‌ها و دستاوردها**: ۱۸ ماموریت گوناگون برای افزایش دائمی ضریب امتیاز تا ۱۰ برابر، جعبه‌های جایزه، و شکار حروف کلمه **SPRINT**.
- 🔥 **۴ سطح سختی پویا**: حالت‌های آسان (Easy)، نرمال (Normal)، سخت (Hard) و غیرممکن (Impossible).
- 🔒 **۱۰۰٪ رایگان و حامی حریم خصوصی**: هیچ‌گونه تبلیغات، پرداخت درون‌برنامه‌ای، ارسال اطلاعات به اینترنت یا نیاز به ثبت‌نام وجود ندارد.
- ✈️ **قابلیت اجرای آفلاین (PWA)**: با یک بار باز کردن بازی، در دفعات بعدی حتی بدون دسترسی به اینترنت نیز بازی اجرا می‌شود.

---

### 🚀 آموزش نصب و اجرا برای افراد کاملاً مبتدی

اگر تا به حال حتی یک خط کد هم ننوشته‌اید، اصلاً نگران نباشید! این آموزش برای شما تهیه شده است.

#### 📌 پیش‌نیاز بسیار ساده: نصب Node.js (تنها یک بار)
تنها برنامه‌ای که کامپیوتر شما برای اجرای بازی به آن نیاز دارد **Node.js** است.
1. به وبسایت رسمی نود جی‌اس بروید: **[https://nodejs.org](https://nodejs.org/)**
2. روی دکمه سبز رنگ سمت چپ که نوشته **LTS (Recommended for Most Users)** کلیک کنید تا فایل نصبی دانلود شود.
3. فایل دانلود شده را باز کنید و در تمام مراحل دکمه‌های **Next** و در پایان **Install** و **Finish** را بزنید (نیازی به تغییر هیچ گزینه‌ای نیست).

---

#### روش ۱: اجرای فوق‌سریع با یک کلیک (مخصوص ویندوز)
اگر فایل‌های این پروژه را روی کامپیوتر خود دارید:
1. پوشه پروژه را باز کنید.
2. روی فایل **`start-windows.bat`** دو بار کلیک کنید!
3. یک پنجره سیاه ظاهر می‌شود و به صورت خودکار ملزومات را نصب کرده و بازی را در مرورگر اینترنت شما باز می‌کند. همین! 🎮

*(برای کاربران مک یا لینوکس، کافی است فایل `start-linux-mac.sh` را در ترمینال اجرا کنید).*

---

#### روش ۲: دانلود بدون نیاز به Git (فایل ZIP)
1. در بالای همین صفحه گیت‌هاب، روی دکمه سبز رنگ **Code** کلیک کنید.
2. گزینه **Download ZIP** را انتخاب نمایید.
3. پس از دانلود، روی فایل ZIP راست‌کلیک کرده و گزینه **Extract All** (یا Extract Here) را بزنید تا پوشه باز شود.
4. وارد پوشه باز شده شوید و روی فایل **`start-windows.bat`** دو بار کلیک کنید.

---

#### روش ۳: روش مرسوم و استاندارد با ترمینال

اگر می‌خواهید با دستورات ساده سیستم خود کار کنید:

۱. **باز کردن ترمینال**:
- **در ویندوز**: کلید `Win + R` را بزنید، بنویسید `cmd` و اینتر را فشار دهید. (یا داخل سرچ ویندوز بنویسید PowerShell).
- **در مک (Mac)**: کلید `Command + Space` را بزنید، بنویسید `Terminal` و اینتر کنید.

۲. **دریافت پروژه (Clone)**:
دستور زیر را کپی کرده و در ترمینال پیست کنید و اینتر را بزنید:
```bash
git clone https://github.com/parzivalii/subway-surfers-higgsfield-GPT6-ASTRA.git
```

۳. **ورود به پوشه پروژه**:
```bash
cd subway-surfers-higgsfield-GPT6-ASTRA
```

۴. **نصب وابستگی‌ها (فقط بار اول)**:
```bash
npm install
```

۵. **اجرای بازی**:
```bash
npm run dev
```

پس از اجرای این دستور، پیامی شبیه به این مشاهده می‌کنید:
```text
  VITE v8.2.2  ready in 250 ms

  ➜  Local:   http://localhost:5173/
```
حالا مرورگر خود (گوگل کروم یا فایرفاکس) را باز کنید و به آدرس زیر بروید:  
👉 **`http://localhost:5173`**  
بازی آماده است؛ لذت ببرید!

---

### 🕹️ راهنمای کنترل‌ها و کلیدهای بازی

| عمل | کلید پیش‌فرض در کیبورد | عملکرد در بازی |
| :--- | :--- | :--- |
| **حرکت به چپ** | **A** یا **کلید فلش چپ (←)** | جابه‌جایی سریع به لاین سمت چپ |
| **حرکت به راست** | **D** یا **کلید فلش راست (→)** | جابه‌جایی سریع به لاین سمت راست |
| **پرش (Jump)** | **W** یا **کلید فلش بالا (↑)** | پریدن از روی موانع کوتاه و قطارها |
| **سر خوردن (Slide)** | **S** یا **کلید فلش پایین (↓)** | غلت زدن و رد شدن از زیر موانع و تابلوها |
| **فرود سریع** | **S** یا **کلید فلش پایین (↓)** *(در هوا)* | اگر در حال پرش هستید، سریعاً به زمین برمی‌گردید |
| **فعال‌سازی اسکیت** | **Space (فاصله‌گیر)** | باز کردن هاوربرد و ایجاد سپر ایمنی ضد برخورد |
| **توقف بازی (Pause)** | **Escape** یا **P** | توقف بازی و نمایش منوی بازگشت |
| **تایید / انتخاب** | **Enter** | کلیک روی گزینه‌ها در منوها |
| **جابه‌جایی در منو** | **Tab** / **Shift+Tab** | تغییر دکمه انتخابی در منو با کیبورد |

> **نکته**: برای تغییر کلیدها، می‌توانید در صفحه اصلی به منوی **Settings (تنظیمات)** بروید و کلیدهای دلخواه خود را تعیین کنید.

---

### 🧑‍🎨 معرفی کاراکترها، اسکیت‌ها و آیتم‌ها

#### کاراکترها (The Crew):
1. **Pip (پیپ)**: دونده چابک و کاراکتر پیش‌فرض شما.
2. **Jett (جت)**: دونده سرعتی با استایل خیابانی مدرن.
3. **Nori (نوری)**: ماجراجوی ماهر و باهوش.
4. **Rumi (رومی)**: با لباس و گرافیتی خاص و پرانرژی.
5. **Tavi (تاوی)**: حرفه‌ای در مسیرهای چالش‌برانگیز و صنعتی.
*هر کاراکتر دارای یک لباس جایگزین (Alternate Outfit) است که با سکه‌های جمع‌آوری‌شده در بازی باز می‌شود.*

#### هاوربردها (Hoverboards):
- **Tide (تاید)**: دارای قدرت مانور بالا و جهش‌های دقیق‌تر.
- **Ember (امبر)**: اسکیت آتشی و پرانرژی با قابلیت کنترل فرود نرم.
- **ویژگی مشترک**: هر هاوربرد به مدت ۱۸ ثانیه فعال می‌ماند یا در صورت برخورد با موانع، جان شما را نجات داده و مانع از باختن می‌شود!

---

### ⚡ درجه‌های سختی بازی (Difficulty Modes)

در منوی اصلی بازی، دکمه **Difficulty** قرار دارد که به شما امکان انتخاب یکی از ۴ درجه سختی را می‌دهد:
- 🟢 **آسان (Easy)**: سرعت شروع ۱۲ و حداکثر ۲۶ متر بر ثانیه، شتاب ملایم و مسیرهای کاملاً هموار.
- 🟡 **معمولی (Normal)**: سرعت شروع ۱۶ و حداکثر ۲۹ متر بر ثانیه، نیاز به پرش و تکل‌های دوره‌ای.
- 🔴 **سخت (Hard)**: سرعت شروع ۲۰ و حداکثر ۳۲ متر بر ثانیه، جابه‌جایی مداوم لاین‌ها و موانع نزدیک‌تر.
- 💀 **غیرممکن (Impossible)**: سرعت شروع ۲۶ و حداکثر ۳۶ متر بر ثانیه، رسیدن به حداکثر سرعت در ۱۲ ثانیه و واکنش‌های صدم‌ثانیه‌ای!

---

### 💾 حالت آفلاین و ذخیره‌سازی داده‌ها

- **ذخیره خودکار**: تمام سکه‌ها، رکوردها، کاراکترهای خریداری‌شده و تنظیمات به صورت محلی در مرورگر شما ذخیره می‌شوند.
- **پشتیبان‌گیری (Export / Import)**: در منوی تنظیمات می‌توانید از ذخیره‌های خود یک فایل خروجی JSON بگیرید یا آن را به مرورگر دیگری منتقل کنید.
- **بازی بدون اینترنت (Offline)**: بازی مجهز به Service Worker است. پس از اولین بار لود شدن کامل، علامت سبز رنگ **Offline ready** در صفحه ظاهر می‌شود؛ از این پس حتی بدون اینترنت هم بازی در مرورگر باز خواهد شد.

---

### 🛠️ رفع مشکلات رایج (Troubleshooting)

- **خطای `'node' is not recognized` در ترمینال**:
  - دلیل: نرم‌افزار Node.js نصب نشده یا به مسیر سیستم (PATH) اضافه نشده است.
  - راه‌حل: نود جی‌اس را از [nodejs.org](https://nodejs.org/) دانلود و دوباره نصب کنید، سپس یک بار پنجره ترمینال را ببندید و دوباره باز کنید.
- **خطای پورت ۵۱۷۳ اشغال است (Port 5173 is in use)**:
  - راه‌حل: یک تب یا پنجره دیگر در حال اجرای برنامه است. آن پنجره را ببندید یا اجازه دهید Vite به صورت خودکار شما را به پورت بعدی (مثلاً 5174) هدایت کند.
- **صفحه بازی سیاه است یا لود نمی‌شود**:
  - دلیل: عدم پشتیبانی یا غیرفعال بودن شتاب‌دهنده گرافیکی (Hardware Acceleration / WebGL 2).
  - راه‌حل: مطمئن شوید از مرورگرهای مدرن مثل Chrome، Edge یا Firefox استفاده می‌کنید. در تنظیمات مرورگر، گزینه `Use graphics acceleration when available` را فعال کنید.

---

### 💻 اطلاعات ویژه برنامه‌نویسان

اگر مایل به توسعه یا مشاهده کدهای پروژه هستید:
- **تکنولوژی‌ها**: React 19, TypeScript (Strict Mode), Three.js, Vite, Vitest.
- **معماری شبیه‌سازی**: حلقه فیزیک با نرخ فریم ثابت 60Hz به طور کامل از چرخه رندر React جدا شده است تا حداکثر کارایی و روان بودن را تضمین کند.
- **اجرای تست‌ها**:
  ```bash
  npm test
  ```
- **بررسی صحت انواع داده (Typecheck)**:
  ```bash
  npm run typecheck
  ```
- **ساخت نسخه پروداکشن (Build)**:
  ```bash
  npm run build
  ```
- **اجرای پیش‌نمایش پروداکشن**:
  ```bash
  npm run preview
  ```

---
---

<a name="english-guide"></a>
# 🇬🇧 English Guide & Tutorial

Welcome to **Switchyard Sprint (Subway Surfers Astra)**!  
This project is an original, production-ready, 3D railway endless runner built entirely for modern desktop web browsers using **TypeScript, Three.js, React 19, and Vite**.

It brings the fluid responsiveness, high-speed adrenaline, and progressive unlock systems of classic Subway Surfers directly into your browser with zero external dependencies, zero ads, zero tracking, and complete offline support!

---

## 📖 Table of Contents (English)
1. [Key Features](#key-features)
2. [Complete Beginner's Tutorial (Zero Coding Knowledge Required)](#complete-beginners-tutorial)
   - [Method 1: 1-Click Launch (Windows)](#method-1-1-click-launch-windows)
   - [Method 2: Download as ZIP (No Git needed)](#method-2-download-as-zip-no-git-needed)
   - [Method 3: Standard Terminal / Git Clone](#method-3-standard-terminal--git-clone)
3. [Game Controls](#game-controls)
4. [Characters, Hoverboards & Power-ups](#characters-hoverboards--power-ups)
5. [Difficulty Tiers](#difficulty-tiers)
6. [Offline PWA & Local Storage](#offline-pwa--local-storage)
7. [Troubleshooting & FAQ](#troubleshooting--faq)
8. [Technical Architecture & Developer Guide](#technical-architecture--developer-guide)

---

### ✨ Key Features

- 🏎️ **Ultra-Responsive Mechanics**: Swept collision detection, air lane changes, variable jumps, and slide recovery.
- 🛹 **Dynamic Hoverboards**: Tide and Ember boards absorb crashes and give unique aerial abilities.
- 🧑‍🤝‍🧑 **5 Playable Crew Members & 10 Outfits**: Unlock Pip, Jett, Nori, Rumi, and Tavi with in-game coins.
- ⚡ **4 Classic Power-ups**:
  - 🧲 **Coin Magnet**: Pulls all nearby coins directly to you.
  - 🚀 **Jetpack**: Soar above the rails through a safe coin trail.
  - 👟 **Super Sneakers**: Leap high into the sky and over entire train cars.
  - ✖️ **Score Multiplier**: Temporarily double your score yield.
- 🏆 **Deep Local Progression**: 18 dynamic missions, permanent score multipliers up to ×10, 14 achievements, reward boxes, and letter hunts (**S-P-R-I-N-T**).
- ⚙️ **4 Difficulty Modes**: Easy, Normal, Hard, and Impossible.
- 🌐 **100% Privacy & Local Safety**: No tracking, no user accounts, no telemetry, and zero microtransactions.
- 🔌 **Offline Ready**: Instant loading with built-in PWA Service Worker.

---

### 🚀 Complete Beginner's Tutorial

Even if you have never used a terminal or written code before, you can get this game running in under 2 minutes!

#### 📌 Prerequisite: Install Node.js (Only once)
Node.js is the free, safe engine that runs the local game server.
1. Download Node.js from the official site: **[https://nodejs.org](https://nodejs.org/)**
2. Choose the **LTS (Recommended for Most Users)** version.
3. Open the downloaded installer and click **Next -> Next -> Install -> Finish** with default settings.

---

#### Method 1: 1-Click Launch (Windows)
If you already have the repository files on your computer:
1. Open the project folder.
2. Double-click **`start-windows.bat`**.
3. A terminal window will open, automatically install any missing dependencies, start the server, and pop up your web browser with the game running! 🚀

*(On macOS or Linux, run `./start-linux-mac.sh` in the terminal).*

---

#### Method 2: Download as ZIP (No Git needed)
1. On this GitHub repository page, click the green **Code** button at the top right.
2. Select **Download ZIP**.
3. Extract the downloaded ZIP file to a folder of your choice.
4. Open the folder and double-click **`start-windows.bat`**.

---

#### Method 3: Standard Terminal / Git Clone

1. **Open your command line / terminal**:
   - **Windows**: Press `Win + R`, type `cmd` or `powershell`, and press Enter.
   - **macOS**: Press `Command + Space`, type `Terminal`, and press Enter.
   - **Linux**: Press `Ctrl + Alt + T`.

2. **Clone the repository**:
   ```bash
   git clone https://github.com/parzivalii/subway-surfers-higgsfield-GPT6-ASTRA.git
   ```

3. **Navigate into the directory**:
   ```bash
   cd subway-surfers-higgsfield-GPT6-ASTRA
   ```

4. **Install packages** (first time only):
   ```bash
   npm install
   ```

5. **Start the game**:
   ```bash
   npm run dev
   ```

6. **Play**:
   Open your browser and visit:  
   👉 **`http://localhost:5173`**

---

### 🕹️ Game Controls

| Action | Default Keyboard Key | Description |
| :--- | :--- | :--- |
| **Move Left** | **A** or **Left Arrow (←)** | Switch to the left railway lane |
| **Move Right** | **D** or **Right Arrow (→)** | Switch to the right railway lane |
| **Jump** | **W** or **Up Arrow (↑)** | Leap over barriers and onto train ramps |
| **Slide / Duck** | **S** or **Down Arrow (↓)** | Duck under overhead signs and low hurdles |
| **Fast Drop** | **S** or **Down Arrow (↓)** *(airborne)* | Immediately dive back down to the rails |
| **Activate Hoverboard** | **Spacebar** | Mount your hoverboard for speed and shield protection |
| **Pause Game** | **Escape** or **P** | Pause gameplay with a 3-second resume countdown |
| **Menu Confirm** | **Enter** | Trigger focused UI actions |
| **Menu Navigation** | **Tab** / **Shift+Tab** | Navigate interactive menu elements |

> **Customization**: All key bindings can be freely remapped in the **Settings** menu!

---

### 🧑‍🎨 Characters, Hoverboards & Power-ups

#### The Crew
- **Pip**: The default, agile railway sprinter.
- **Jett**: High-energy speed specialist.
- **Nori**: Tactical and nimble runner.
- **Rumi**: Vibrant street-art enthusiast.
- **Tavi**: Industrial dock master.
*All characters feature unlocked or purchasable alternate outfits via in-game currency.*

#### Hoverboards
- **Tide Board**: Smooth drift and a minor jump height boost.
- **Ember Board**: Blazing trail with precise descent control.
- **Shield Effect**: Each board gives 18 seconds of active time or completely absorbs one fatal collision.

---

### ⚡ Difficulty Tiers

Select your desired run pace before any run using the **Difficulty** selector:

| Tier | Speed Range | Acceleration | Route Complexity |
| :--- | :--- | :--- | :--- |
| **Easy** | 12 → 26 m/s | 0.075 m/s² | Clear lanes, relaxed reaction windows |
| **Normal** | 16 → 29 m/s | 0.18 m/s² | Frequent jumps and slides required |
| **Hard** | 20 → 32 m/s | 0.4 m/s² | Alternating side and center lane switches |
| **Impossible** | 26 → 36 m/s | 0.8 m/s² | Max speed in 12.5s; twitch reaction test |

---

### 💾 Offline PWA & Local Storage

- **100% Local Saves**: High scores, coin balances, unlocks, and settings stay private in your browser's local storage.
- **Import / Export**: Under `Settings`, you can export your entire profile as a validated JSON file to backup or transfer between computers.
- **Offline Play**: When the green **Offline ready** badge appears in the bottom status bar, the game is cached. You can play completely disconnected from the internet.

---

### 🛠️ Troubleshooting & FAQ

- **Q: `'node'` is not recognized as an internal or external command.**
  - **Fix**: Node.js was not added to your system environment variables. Reinstall Node.js from [nodejs.org](https://nodejs.org/) and make sure the option "Add to PATH" is checked, then restart your terminal.
- **Q: Port 5173 is already in use.**
  - **Fix**: Another Vite process is running. Vite will automatically prompt you to use another port (e.g., 5174), or you can close the other terminal window.
- **Q: The screen is black or 3D graphics fail to render.**
  - **Fix**: WebGL 2 is required. Ensure your graphics drivers are up to date and that "Use hardware acceleration when available" is turned ON in your browser settings.

---

### 💻 Technical Architecture & Developer Guide

For developers and contributors looking to inspect or expand the code:

- **Decoupled 60 Hz Loop**: The simulation runs on a deterministic fixed 60 Hz timestep with bounded catch-up and interpolation, entirely decoupled from React's render cycles.
- **Low-Frequency UI Snapshots**: React only receives state snapshots at 10 Hz, preventing unnecessary DOM reconciliations during high-speed gameplay.
- **Run Unit Tests**:
  ```bash
  npm test
  ```
  *(Passes all 68 thorough procedural generation, difficulty, and progression unit tests).*
- **Run Typechecking**:
  ```bash
  npm run typecheck
  ```
- **Produce Production Distribution**:
  ```bash
  npm run build
  ```
- **Local Static Server**:
  ```bash
  npm run serve -- --port 4173
  ```

---

## 📜 License & Credits

- Built with **React 19**, **Three.js**, **Vite**, and **TypeScript**.
- Typography: *Outfit* and *DM Sans* bundled via Fontsource under SIL Open Font License.
- Original game design, code, audio synthesis, and procedural systems authored locally.
- Free for personal, educational, and non-commercial development.