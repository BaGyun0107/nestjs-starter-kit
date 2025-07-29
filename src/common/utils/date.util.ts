import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// dayjs 플러그인 확장
dayjs.extend(utc);
dayjs.extend(timezone);

interface DateInfo {
  koreanDate: string;
  koreanTime: string;
  orderDate: string;
}

export class DateUtil {
  /**
   * 현재 한국 시간 정보를 반환합니다.
   *
   * @returns {Object} { koreanDate, koreanTime, orderDate }
   *
   * @example
   * const { koreanDate, koreanTime, orderDate } = DateUtil.krDate();
   * console.log(koreanDate); // 예: "2021-09-02"
   * console.log(koreanTime); // 예: "15:00"
   * console.log(orderDate);  // 예: "20210902150000000"
   */
  static krDate(): DateInfo {
    const krCurrentDate = dayjs().tz('Asia/Seoul');

    const koreanDate = krCurrentDate.format('YYYY-MM-DD');
    const koreanTime = krCurrentDate.format('HH:mm');
    const orderDate = krCurrentDate.format('YYYYMMDDHHmmssSSS');

    return { koreanDate, koreanTime, orderDate };
  }
}
