import type { PresetTemplate } from "./types";

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "ecommerce-suite",
    title: "电商爆款商品图",
    description: "为同一款商品动态策划一组可直接用于电商店铺的商品图",
    prompt:
      "请以用户上传的参考图作为唯一商品依据，为同一款商品动态策划一组可直接用于电商店铺的商品图。保持商品品牌、外观、材质完全一致，不得篡改或替换品牌标识。每张图片呈现不同的使用场景、角度或搭配，涵盖主图、细节图、场景图、对比图等电商常见类型。画面需专业、干净、有质感，突出商品卖点。不要生成拼图、海报或带文字的图片。",
    count: 8,
    size: "1024x1024",
    imageSrc: "/preset-templates/ecommerce-suite.svg",
    imageAlt: "电商爆款商品图",
    needsReference: true,
  },
  {
    id: "world-landmarks",
    title: "全球旅拍大片",
    description: "在不同世界地标前生成旅行打卡照",
    prompt:
      "请以用户上传的参考图中的人物为原型，生成一组在全球著名地标前的旅拍大片。每张图片呈现不同的世界地标场景（如埃菲尔铁塔、金字塔、自由女神像、富士山等），人物保持一致的容貌和穿搭风格。画面需有旅行感、光影自然、构图优美，呈现游客打卡照的真实感。不要生成拼图或带文字的图片。",
    count: 6,
    size: "1024x1536",
    imageSrc: "/preset-templates/world-landmarks.svg",
    imageAlt: "全球旅拍大片",
    needsReference: true,
  },
  {
    id: "portrait-editorial",
    title: "个人形象写真",
    description: "生成不同风格的个人形象写真照",
    prompt:
      "请以用户上传的参考图中的人物为原型，生成一组个人形象写真。每张图片呈现不同的拍摄风格和场景，如商务形象、休闲日常、户外自然光、棚拍纯色背景等。人物保持一致的容貌特征，表情和姿态自然丰富。画面需有专业摄影质感，光影细腻，色调统一。不要生成拼图或带文字的图片。",
    count: 8,
    size: "1024x1536",
    imageSrc: "/preset-templates/portrait-editorial.svg",
    imageAlt: "个人形象写真",
    needsReference: true,
  },
  {
    id: "wedding-portrait",
    title: "高定婚纱旅拍",
    description: "生成高端婚纱旅拍系列照片",
    prompt:
      "请以用户上传的参考图中的情侣为原型，生成一组高定婚纱旅拍照片。每张图片呈现不同的浪漫场景，如海边日落、古堡花园、城市天台、森林秘境等。人物保持一致的容貌，婚纱款式可微调但风格统一。画面需有高级感、梦幻光影、唯美构图。不要生成拼图或带文字的图片。",
    count: 8,
    size: "1024x1536",
    imageSrc: "/preset-templates/wedding-portrait.svg",
    imageAlt: "高定婚纱旅拍",
    needsReference: true,
  },
  {
    id: "senior-portrait",
    title: "长辈纪念写真",
    description: "为长辈生成温馨纪念写真照片",
    prompt:
      "请以用户上传的参考图中的长辈为原型，生成一组温馨纪念写真。每张图片呈现不同的生活场景，如公园散步、茶室品茗、家庭团聚、书房阅读等。人物保持一致的容貌特征，表情温暖慈祥。画面需有柔和光影、温暖色调、庄重而不失亲切的氛围。不要生成拼图或带文字的图片。",
    count: 8,
    size: "1024x1536",
    imageSrc: "/preset-templates/senior-portrait.svg",
    imageAlt: "长辈纪念写真",
    needsReference: true,
  },
  {
    id: "men-cool-portrait",
    title: "男士商务大片",
    description: "生成不同场景的男士商务形象照",
    prompt:
      "请以用户上传的参考图中的男士为原型，生成一组商务大片。每张图片呈现不同的商务场景，如办公室、会议室、城市街头、商务出行等。人物保持一致的容貌，着装以西装、衬衫等商务风格为主，可变化配色。画面需有精英感、利落光影、专业构图。不要生成拼图或带文字的图片。",
    count: 8,
    size: "1024x1536",
    imageSrc: "/preset-templates/men-cool-portrait.svg",
    imageAlt: "男士商务大片",
    needsReference: true,
  },
  {
    id: "women-elegant-portrait",
    title: "女士轻奢大片",
    description: "生成不同风格的女士轻奢形象照",
    prompt:
      "请以用户上传的参考图中的女士为原型，生成一组轻奢大片。每张图片呈现不同的时尚场景，如咖啡厅、艺术展厅、精品酒店、都市街头等。人物保持一致的容貌，穿搭以优雅轻奢风格为主，可变化配色和配饰。画面需有时尚感、精致光影、高级色调。不要生成拼图或带文字的图片。",
    count: 8,
    size: "1024x1536",
    imageSrc: "/preset-templates/women-elegant-portrait.svg",
    imageAlt: "女士轻奢大片",
    needsReference: true,
  },
  {
    id: "kids-series",
    title: "儿童成长影像",
    description: "为小朋友生成不同场景的成长纪念照",
    prompt:
      "请以用户上传的参考图中的儿童为原型，生成一组成长影像。每张图片呈现不同的生活场景，如游乐场、教室、公园、生日派对等。儿童保持一致的容貌特征，表情天真活泼。画面需有明亮色彩、自然光影、温馨活泼的氛围。不要生成拼图或带文字的图片。",
    count: 8,
    size: "1024x1536",
    imageSrc: "/preset-templates/kids-series.svg",
    imageAlt: "儿童成长影像",
    needsReference: true,
  },
];
