import openpyxl

wb = openpyxl.load_workbook("exports/vignan_data_coverage_matrix.xlsx", data_only=True)
ws = wb["Coverage_Matrix"]
for row in ws.iter_rows(values_only=True):
    print(row)
