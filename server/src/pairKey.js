// "541-529" and "529-541" both become "529-541".
export function pairKey(a, b) {
  return [Number(a), Number(b)].sort((x, y) => x - y).join("-");
}
