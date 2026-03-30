/**
 * Normalize messy city strings to core city names.
 * "上海(总部)" → "上海", "广东佛山顺德" → "佛山", "北京-海淀" → "北京"
 */

const MAJOR_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆',
  '天津', '苏州', '长沙', '郑州', '东莞', '青岛', '宁波', '合肥', '厦门', '福州',
  '济南', '沈阳', '大连', '哈尔滨', '长春', '昆明', '贵阳', '南宁', '南昌', '太原',
  '石家庄', '兰州', '银川', '西宁', '乌鲁木齐', '呼和浩特', '海口', '拉萨',
  '珠海', '佛山', '无锡', '常州', '温州', '绍兴', '嘉兴', '金华', '台州', '湖州',
  '中山', '惠州', '扬州', '泉州', '烟台', '潍坊', '徐州', '保定', '唐山', '洛阳',
  '镇江', '芜湖', '襄阳', '宜昌', '岳阳', '株洲', '遵义', '桂林', '柳州', '吉林',
  '景德镇', '赣州', '漳州', '泰州', '盐城', '临沂', '济宁', '廊坊', '秦皇岛',
]

const PROVINCES = [
  '广东', '江苏', '浙江', '山东', '河南', '河北', '湖北', '湖南', '四川', '福建',
  '安徽', '江西', '辽宁', '陕西', '云南', '贵州', '广西', '山西', '内蒙古', '新疆',
  '甘肃', '海南', '宁夏', '青海', '西藏', '吉林', '黑龙江',
]

export function normalizeCity(raw: string | null): string | null {
  if (!raw) return null

  // Strip parentheses content: "上海(总部)" → "上海"
  let city = raw.replace(/[（(][^）)]*[）)]/g, '').trim()

  // Take first segment split by space, comma, slash, dash
  city = city.split(/[\s,，、/\-]+/)[0].trim()

  // Strip province prefix: "广东佛山顺德" → "佛山顺德" → "佛山"
  for (const prov of PROVINCES) {
    if (city.startsWith(prov) && city.length > prov.length) {
      city = city.slice(prov.length)
      break
    }
  }

  // Match against known major cities (prefix match)
  for (const mc of MAJOR_CITIES) {
    if (city.startsWith(mc)) return mc
  }

  // If still long (>4 chars), take first 2-3 chars as city name
  if (city.length > 4) {
    // Check if first 3 chars are a city
    const three = city.slice(0, 3)
    for (const mc of MAJOR_CITIES) {
      if (mc === three) return mc
    }
    // Default: take first 2 chars
    return city.slice(0, 2)
  }

  // Filter out non-city values
  const nonCities = ['全国', '省内', '海外', '远程', '线上', '不限', '其它', '其他', '云南及']
  for (const nc of nonCities) {
    if (city.includes(nc)) return null
  }

  return city || null
}

/** Get unique sorted normalized city names from jobs */
export function getUniqueCities(rawCities: (string | null)[]): string[] {
  const set = new Set<string>()
  for (const raw of rawCities) {
    const norm = normalizeCity(raw)
    if (norm) set.add(norm)
  }
  return Array.from(set).sort()
}
