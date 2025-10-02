@echo off
echo Creating participants...

curl -X POST http://localhost:3001/api/participants ^
  -H "Content-Type: application/json" ^
  -d "{\"partnerId\":\"PART-2024-001\",\"fullName\":\"Ahmed Ben Ali\",\"email\":\"ahmed.001@matc.com\",\"firstName\":\"Ahmed\",\"lastName\":\"Ben Ali\",\"phone\":\"+216 98 123 456\",\"address\":\"Tunis, Tunisie\"}"

curl -X POST http://localhost:3001/api/participants ^
  -H "Content-Type: application/json" ^
  -d "{\"partnerId\":\"PART-2024-002\",\"fullName\":\"Fatima Zahra\",\"email\":\"fatima.002@matc.com\",\"firstName\":\"Fatima\",\"lastName\":\"Zahra\",\"phone\":\"+216 97 654 321\",\"address\":\"Sfax, Tunisie\"}"

curl -X POST http://localhost:3001/api/participants ^
  -H "Content-Type: application/json" ^
  -d "{\"partnerId\":\"PART-2024-003\",\"fullName\":\"Mohamed Slim\",\"email\":\"mohamed.003@matc.com\",\"firstName\":\"Mohamed\",\"lastName\":\"Slim\",\"phone\":\"+216 99 888 777\",\"address\":\"Sousse, Tunisie\"}"

echo Done!
pause
