// oyunun calisip calismadigini saklar
let oyunBasladi = false;
// oyunun zorluk seviyesi
let zorlukSeviyesi = 1;
// muzik
let music = new Audio("assets/sound/music.mp3");
// canvas
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
// menu div
let menu = document.getElementsByClassName("menu")[0];
// oyun sonu div
let oyunSonuEkrani = document.getElementsByClassName("end")[0];

// filenin genisliği
const fileGenisligi = 10;
// oyunun dongu hızı. milisaniye
const donguHizi = 10;
// top başlangıç hızı
let topHizi = 3.5;

// yukari tusuna basilip basilmadigin tutar
let yukariTusaBasildi = false;
// asagi tusuna basilip basilmadigin tutar
let asagiTusaBasildi = false;
// oyuncu topu her karşıladığında topun hızlanma katsayısı
let hizlanmaKatsayisi = 0.1;
// bilgisayarın raketi oynatma hızı
let bilgisayarRaketHizi = 1;
// oyuncu raketi hızı
let oyuncuRaketHizi = 5;
// oyun bitiş puanı
const bitisPuani = 10;
let oyunDonguInterval;

// raket tanımları
const raket = {
  boy: 100,
  en: 20,
  ciz: function (x, y, renk) {
    dortgenCiz(x, y, this.en, this.boy, renk);
  }
};

// oyuncu raketinin objesi
const oyuncuRaket = {
  x: 20,
  y: 0,
  renk: "white",
  ciz: function () {
    raket.ciz(this.x, this.y, this.renk);
  },
  yukariGit: function () {
    if (this.ustKenar() > 0) this.y -= oyuncuRaketHizi;
  },
  asagiGit: function () {
    if (this.altKenar() < canvas.height) this.y += oyuncuRaketHizi;
  },
  skor: 0,
  solKenar: function () {
    return this.x;
  },
  sagKenar: function () {
    return this.x + raket.en;
  },
  ustKenar: function () {
    return this.y;
  },
  altKenar: function () {
    return this.y + raket.boy;
  },
  ortala: function () {
    this.y = canvas.height / 2 - raket.boy / 2;
  },
  sifirla: function () {
    this.ortala();
    this.skor = 0;
  },
  skorAl: function () {
    this.skor++;
    if (this.skor === bitisPuani) {
      // eğer skor bitiş skoruna geldiyse oyunu bilgisayar kazandı
      oyunBitti(0);
    }
  }
};

// bilgisayar raketinin objesi
const bilgRaket = {
  x: canvas.width - 20 - raket.en, // kanvasın sag tarafından 20 piksel sola cizelim
  y: 0,
  renk: "white",
  ciz: function () {
    raket.ciz(this.x, this.y, this.renk);
  },
  git: function () {
    // top raketin dikey olarak neresinde kalıyorsa oraya doğrı belirli hızda hareket et
    if (topp.yatayHiz > 0)
      if (topp.y > this.y + raket.boy / 2) {
        // eğer bilgisayar doğru hareket ediyorsa
        if (this.altKenar() >= canvas.height)
          // alt banta çarptıysa dur
          this.y = canvas.height - raket.boy;
        else this.y += bilgisayarRaketHizi;
      } else {
        if (this.ustKenar() <= 0)
          // üst banta çarptıysa dur
          this.y = 0;
        else this.y -= bilgisayarRaketHizi;
      }
  },
  skor: 0,
  solKenar: function () {
    return this.x;
  },
  sagKenar: function () {
    return this.x + raket.en;
  },
  ustKenar: function () {
    return this.y;
  },
  altKenar: function () {
    return this.y + raket.boy;
  },
  ortala: function () {
    this.y = canvas.height / 2 - raket.boy / 2;
  },
  sifirla: function () {
    this.ortala();
    this.skor = 0;
  },
  skorAl: function () {
    this.skor++;
    if (this.skor === bitisPuani) {
      // eğer skor bitiş skoruna geldiyse oyunu bilgisayar kazandı
      oyunBitti(1);
    }
  }
};

const topp = {
  x: 0,
  y: 0,
  yariCap: 10,
  renk: "white",
  hiz: topHizi, // topun mevcut hızı.
  yatayHiz: -1, // topun yatay yönü. -1 ise sola, +1 ise sağa gider
  dikeyHiz: 0, // topun dikey yönü. -1 ise yukarı, +1 ise asagi gider
  solKenar: function () {
    return this.x - this.yariCap;
  },
  sagKenar: function () {
    return this.x + this.yariCap;
  },
  ustKenar: function () {
    return this.y - this.yariCap;
  },
  altKenar: function () {
    return this.y + this.yariCap;
  },
  ciz: function () {
    daireCiz(this.x, this.y, this.yariCap, this.renk);
  },
  git: function () {
    if (this.oyuncuRaketeCarptimi() || this.bilgRaketeCarptimi()) {
      // yatayda tam aksi istikamete gitmesi için -1 ile çarpıyoruz
      this.yatayHiz = this.yatayHiz * -1;

      // topun rakete çarptığı noktanın raketin boyuna oranı
      let carpmaNoktasi =
        (this.y - (oyuncuRaket.y + raket.boy / 2)) / (raket.boy / 2);
      // çarptığı noktaya göre yeni açı hesaplyırouz
      // raketin üst kısmına çarptıysa -45, alt kısmına çarptıysa 45 dere ile gidecek
      let yeniAci = (Math.PI / 4) * carpmaNoktasi;
      this.dikeyHiz = Math.sin(yeniAci);

      // top her rakete çaprığında hızı artsın ( gittikçe zorlaşsın)
      this.hiz += hizlanmaKatsayisi;
    } else if (this.x < 0 && this.yatayHiz < 0) {
      bilgRaket.skorAl();
      this.ortala();
    } else if (this.x > canvas.width && this.yatayHiz > 0) {
      oyuncuRaket.skorAl();
      this.ortala();
    }

    if (this.bantaCarptimi()) this.dikeyHiz = this.dikeyHiz * -1;

    this.x += this.yatayHiz * this.hiz; // topun yatay poziasyonu hesapla
    this.y += this.dikeyHiz * this.hiz; // topun dikey  poziasyonu hesapla
  },
  oyuncuRaketeCarptimi: function () {
    return (
      this.yatayHiz < 0 &&
      this.solKenar() >= oyuncuRaket.solKenar() && // raketin içine geçmisse artık çarptı saymayalım
      this.ustKenar() >= oyuncuRaket.ustKenar() && // raketin dikey olarak hizasında mı?
      this.altKenar() <= oyuncuRaket.altKenar() && // raketin dikey olarak hizasında mı?
      this.solKenar() <= oyuncuRaket.sagKenar() // rakete yatayda degdi mi?
    );
  },
  bilgRaketeCarptimi: function () {
    return (
      this.yatayHiz > 0 &&
      this.sagKenar() >= oyuncuRaket.sagKenar() && // raketin içine geçmisse artık çarptı saymayalım
      this.ustKenar() >= bilgRaket.ustKenar() && // raketin dikey olarak hizasında mı?
      this.altKenar() <= bilgRaket.altKenar() && // raketin dikey olarak hizasında mı?
      this.sagKenar() >= bilgRaket.solKenar() // rakete yatayda degdi mi?
    );
  },
  bantaCarptimi: function () {
    return this.ustKenar() <= 0 || this.altKenar() >= canvas.height;
  },
  ortala: function () {
    // başlangıç pozisyonu kanvasın ortası
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.yatayHiz = -1;
    this.dikeyHiz = Math.random();
  },
  sifirla: function () {
    this.ortala();
    this.hiz = topHizi;
  }
};

// Sayfa yüklendiğinde bu fonksiyon çağrılır
// Sayfa ilk kez açıldığında yapılması gerekenler buraya yazılır
function onLoad() {
  window.addEventListener("keydown", tusaBasildi);
  window.addEventListener("keyup", tusBirakildi);

  music.loop = true;
  // ilk açılışta menü gelsin
  menuGoster();

  zorlukDegistir(2);
}
// tuşa basılınca tetiklenen fonksiyon
function tusaBasildi(event) {
  if (oyunBasladi) {
    // oyun başlamadıysa çalışmasın
    yukariTusaBasildi = event.keyCode === 38; // 38 yani yukari oka basildi ise true döner
    asagiTusaBasildi = event.keyCode === 40; // 40 yani asagi oka basildi ise true döner
  }
}
// tuş bırakılınca tetiklenen fonksiyon
function tusBirakildi(event) {
  if (oyunBasladi) {
    // oyun başlamadıysa çalışmasın
    if (event.keyCode === 38) yukariTusaBasildi = false;
    if (event.keyCode === 40) asagiTusaBasildi = false;
  }
}

// zorluk seviyeleri butonlarına basınca bu fonksiyon çağrılıyor
function zorlukDegistir(e) {
  document.getElementById("zorluk1").className = "";
  document.getElementById("zorluk2").className = "";
  document.getElementById("zorluk3").className = "";
  document.getElementById("zorluk" + e).className = "selected";
  zorlukSeviyesi = e;

  switch (zorlukSeviyesi) {
    case 1:
      topHizi = 3.5;
      bilgisayarRaketHizi = 1;
      oyuncuRaketHizi = 5;
      break;
    case 2:
      topHizi = 6;
      bilgisayarRaketHizi = 1.5;
      oyuncuRaketHizi = 6;
      break;
    case 3:
      topHizi = 7.5;
      bilgisayarRaketHizi = 2;
      oyuncuRaketHizi = 8;
      break;
    default:
  }
}

function sesAcKapa() {
  let btn = document.getElementById("sesbutton");
  if (music.paused) {
    btn.className = "on";
    music.play();
  } else {
    btn.className = "off";
    music.pause();
  }
}

// menuye donmek icin cagrilir
function menuGoster() {
  // oyunu durdur
  oyunuDurdur();
  // canvası gizle
  canvas.style.display = "none";
  // son ekranı gizle
  oyunSonuEkrani.style.display = "none";
  // menuyu göster
  menu.style.display = "";
}

// oyunu baslatmak icin cagrilir
function oyunuBaslat() {
  // raketleri balangıç duruma getir
  oyuncuRaket.sifirla();
  bilgRaket.sifirla();
  topp.sifirla();

  // canvası göster
  canvas.style.display = "";
  // menuyu gizle
  menu.style.display = "none";
  // son ekranı gizle
  oyunSonuEkrani.style.display = "none";
  // oyunu başlat
  oyunBasladi = true;
  // oyun dongusunu baslatalim
  oyunDonguInterval = window.setInterval(oyunDongusu, donguHizi);
}

function oyunuDurdur() {
  // oyun durdu işareti
  oyunBasladi = false;
  // donguyu durduralım
  clearInterval(oyunDonguInterval);
}

function masayiCiz() {
  // kanvası temizleyelim
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // fileyi cizelim
  dortgenCiz(
    canvas.width / 2 - fileGenisligi / 2, // kanvasın ortasından filenin genisliğinin yarısı kadar solda olsun ki ortalasın
    0, // kanvasın tepesinden başlayacak
    fileGenisligi,
    canvas.height, // kanvasın yüksekliği kadar
    "white"
  );

  // oyuncu raketini çizelim
  oyuncuRaket.ciz();
  // bilgisayasr raketini çizelim
  bilgRaket.ciz();
  // topu çizelim
  topp.ciz();
  // skorları yazalım
  skorlariYaz();
}

function oyunDongusu() {
  if (oyunBasladi) {
    // oyuncu raketi hareket edecek mi?
    if (yukariTusaBasildi) oyuncuRaket.yukariGit();
    if (asagiTusaBasildi) oyuncuRaket.asagiGit();
    // top hareket etsin
    topp.git();
    // bilgisayar raketi hareketi
    bilgRaket.git();
    masayiCiz();
  }
}

function skorlariYaz() {
  ctx.font = "40px c64";
  ctx.fillText(oyuncuRaket.skor, canvas.width / 2 - 100, 50);
  ctx.fillText(bilgRaket.skor, canvas.width / 2 + 100, 50);
}

function oyunuSifirla() {
  oyunBasladi = false;
  topp.sifirla();
  oyuncuRaket.ortala();
  bilgRaket.ortala();
  oyunBasladi = true;
}

// oyun bitince çağrılıyor
// taraf = 0 oyuncu , taraf = 1 bilgisayar
function oyunBitti(taraf) {
  oyunuDurdur();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let msg = "";
  let img = "";

  if (taraf === 0) {
    msg = "Kazandınız :)";
    img = "assets/images/kupa.png";
  } else {
    msg = "Kaybettiniz :(";
    img = "assets/images/skull.png";
  }

  const title = document.getElementById("endtitle");
  document.getElementById("endimg").src = img;
  title.innerHTML = msg;

  oyunSonuEkrani.style.display = "";
  menu.style.display = "none";
  canvas.style.display = "none";
}

// verilen özelliklere göre kanvasa daire çizer
function daireCiz(x, y, yaricap, renk) {
  ctx.fillStyle = renk;
  ctx.beginPath();
  ctx.arc(x, y, yaricap, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

// verilen ozelliklere göre kanvasa dortgen cizer
function dortgenCiz(x, y, en, boy, renk) {
  ctx.fillStyle = renk;
  ctx.fillRect(x, y, en, boy);
}
