import matplotlib.pyplot as plt
import time
import os
from pycalphad import Database, ternplot
from pycalphad import variables as v

db_al_cu_y = Database('Al_Cu_Y_assessment_files.TDB')
comps = ['AL', 'CU', 'Y', 'VA']
phases = list(db_al_cu_y.phases.keys())
# Ensure the output directory exists
output_dir = 'output_images'
# os.makedirs(output_dir, exist_ok=True)

temperature = 1650

conds = {v.T: temperature, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}


# Set higher DPI for the figure
# plt.rcParams['figure.dpi'] = 300
start_time = time.time()

ax = ternplot(db_al_cu_y, comps, phases, conds, x=v.X('AL'), y=v.X('Y'), label_nodes=True)

end_time = time.time()
print(f"Elapsed time for T = {temperature}: {end_time - start_time:.3f} seconds")



# plt.savefig(os.path.join(output_dir, f'T={temperature}.png'), dpi=300)
plt.savefig(f'T={temperature}.png', dpi = 300)
plt.show() 