@echo off
mysql -h 127.0.0.1 -u sesac -p1234 sesac < migrations/create_password_resets_table.sql
