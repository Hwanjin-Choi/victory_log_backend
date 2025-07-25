from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import time
import re
import csv
import sys
import json

def get_dynamic_html(url):
    options = Options()
    options.add_argument("--headless")  # 브라우저 창을 열지 않음 (백그라운드 실행)
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Chrome WebDriver 설정
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    # 웹사이트 열기
    driver.get(url)
    try:
        # 특정 클래스를 가진 요소가 나타날 때까지 최대 10초 동안 기다림
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[class^='ScheduleLeagueType_match_list_group__']"))
        )
    except TimeoutError:
        print("⚠️ 지정된 시간 내에 요소가 나타나지 않았습니다.")
    # 페이지의 HTML 가져오기
    html = driver.page_source
    driver.quit()  # 브라우저 종료
    return html

# 크롤링할 웹사이트 URL 입력 (반드시 실제 웹사이트 주소로 변경해주세요!)
# url = "https://m.sports.naver.com/kbaseball/schedule/index?category=kbo" # 기존의 하드코딩된 URL

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
        print(f"크롤링 URL: {target_url}")

        # HTML 가져오기
        html_content = get_dynamic_html(target_url)
        soup = BeautifulSoup(html_content, 'html.parser')

        # class 속성이 "Home_container__"로 시작하는 div 찾기
        home_container_div = soup.find('div', class_=re.compile(r'^Home_container__'))

        results = []

        if home_container_div:
            # 찾은 Home_container__ div 내의 모든 경기 목록 그룹 찾기
            match_list_groups = home_container_div.find_all('div', class_=re.compile(r'ScheduleLeagueType_match_list_group__\w+'))

            for match_list_group in match_list_groups:
                match_date = ""  # Initialize match_date for each group
                date_element = match_list_group.find('em', class_=re.compile(r'ScheduleLeagueType_title\w+'))
                if date_element:
                    match_date = date_element.text.strip()
                classes = match_list_group.get('class', [])
                is_today = any('ScheduleLeagueType_type_today' in cls for cls in classes)
                match_items = match_list_group.find_all('li', class_=re.compile(r'MatchBox_match_item__\w+'))

                for item in match_items:
                    home_team = ""
                    home_score = ""
                    away_team = ""
                    away_score = ""
                    status = ""
                    time_info = ""
                    stadium = ""

                    status_element = item.find('em', class_=re.compile(r'MatchBox_status__\w+'))
                    status = status_element.text.strip() if status_element else ""

                    time_element = item.find('div', class_=re.compile(r'MatchBox_time__\w+'))
                    time_info = time_element.text.replace("경기 시간", "").strip() if time_element else ""

                    stadium_element = item.find('div', class_=re.compile(r'MatchBox_stadium__\w+'))
                    stadium = stadium_element.text.replace("경기장", "").strip() if stadium_element else ""


                    link_area = item.find('div', class_=re.compile(r'MatchBoxLinkArea_link_match_wrap__\w+'))
                    if link_area:
                        link_elements = link_area.find_all('a', class_=re.compile(r'MatchBoxLinkArea_link_match__\w+'))


                    teams_info = item.find_all('div', class_=re.compile(r'MatchBoxHeadToHeadArea_team_item__\w+'))
                    scores = item.find_all('strong', class_=re.compile(r'MatchBoxHeadToHeadArea_score__\w+'))
                    team_names = item.find_all('strong', class_=re.compile(r'MatchBoxHeadToHeadArea_team__40JQL'))
                    home_mark = item.find_all('div', class_=re.compile(r'MatchBoxHeadToHeadArea_home_mark__i18Sf'))

                    if len(team_names) == 2:
                        away_team = team_names[0].text.strip()
                        home_team = team_names[1].text.strip()
                        if len(scores) == 2:
                            away_score = scores[0].text.strip()
                            home_score = scores[1].text.strip()
                            if home_mark and home_mark[0].find_parent('div', class_=re.compile(r'MatchBoxHeadToHeadArea_team_name__\w+')).find('strong', class_=re.compile(r'MatchBoxHeadToHeadArea_team__40JQL')).text.strip() != home_team:
                                # 순서가 홈팀, 원정팀이 아닌 경우 보정
                                away_team, home_team = home_team, away_team
                                away_score, home_score = home_score, away_score
                    else:
                        away_score = "0"
                        home_score = "0"


                    results.append({
                        "홈팀": home_team,
                        "홈팀 점수": home_score,
                        "원정팀": away_team,
                        "원정팀 점수": away_score,
                        "상태": status,
                        "시간": time_info,
                        "장소": stadium,
                        "is_today": is_today,
                        "경기 날짜": match_date,  # Add the match_date to result
                    })
            """ 
            csv_file_path = 'baseball_data.csv'
            fieldnames = results[0].keys() if results else []

            if fieldnames:
                with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                    writer.writeheader()
                    for row in results:
                        writer.writerow(row)
            
                print(f"크롤링 결과가 '{csv_file_path}' 파일에 저장되었습니다.")
            else:
                print("오늘 경기 정보를 찾을 수 없습니다.")
            """
            print("---PYTHON SCRIPT OUTPUT START---")
            print(json.dumps(results, ensure_ascii=False))
            print("---PYTHON SCRIPT OUTPUT END---")
        else:
            print("⚠️ 'ScheduleLeagueType_type_today' 클래스를 포함하는 div를 찾을 수 없습니다.")

    else:
        print("⚠️ 크롤링할 URL이 명령행 인수로 전달되지 않았습니다.")

else:
    print("⚠️ 'Home_container__' 클래스를 가진 div를 찾을 수 없습니다.")