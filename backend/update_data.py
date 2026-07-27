import re

with open('src/main/resources/data.sql', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace: NULL, NULL, NULL, NULL, <base_salary>, '$2a$10$...
# with: NULL, '신한은행', '110-123-456789', '직원본인', <base_salary>, '$2a$10$...

new_text = re.sub(r"NULL, NULL, NULL, NULL, (NULL|\d+), '\$2a\$10\$", r"NULL, '신한은행', '110-123-456789', '직원본인', \1, '$2a$10$", text)

with open('src/main/resources/data.sql', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Replacement complete.")
