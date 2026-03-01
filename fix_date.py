# Fix for parse_date function

old_code = """def parse_date(text):
  now = datetime.now()
  text_lower = text.lower().strip()
  if 'сегодня' in text_lower:
    return now.date()
  else:
    if 'завтра' in text_lower:
      return now+timedelta(days=1).date()
    else:
      for day_name,day_num in DAYS_OF_WEEK.items():
        if day_name in text_lower:
          current_day = now.weekday()
          days_ahead = day_num-current_day
          if days_ahead <= 0:
            days_ahead += 7

          now+timedelta(days=days_ahead).date()
          return
        else:
          continue
          date_formats = ['%Y-%m-%d','%d-%m-%Y','%d.%m.%Y','%d/%m/%Y','%d %m %Y']
          for date_format in date_formats:
            try:
              date_obj = datetime.strptime(text,date_format).date()
            except ValueError:
              pass

            date_obj
            return

      return None"""

new_code = """def parse_date(text):
    now = datetime.now()
    text_lower = text.lower().strip()
    if 'сегодня' in text_lower:
        return now.date()
    if 'завтра' in text_lower:
        return (now+timedelta(days=1)).date()
    for day_name,day_num in DAYS_OF_WEEK.items():
        if day_name in text_lower:
            current_day = now.weekday()
            days_ahead = day_num-current_day
            if days_ahead <= 0:
                days_ahead += 7
            return (now+timedelta(days=days_ahead)).date()
    date_formats = ['%Y-%m-%d','%d-%m-%Y','%d.%m.%Y','%d/%m/%Y']
    for date_format in date_formats:
        try:
            return datetime.strptime(text,date_format).date()
        except ValueError:
            pass
    return None"""

with open('tgbot1.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(old_code, new_code)

with open('tgbot1.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
