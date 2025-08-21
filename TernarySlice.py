import matplotlib.pyplot as plt
import time
from pycalphad import Database, ternplot
from pycalphad import variables as v

db_al_cu_y = Database('Al-Cu-Y.tdb')
comps = ['AL', 'CU', 'Y', 'VA']
phases = list(db_al_cu_y.phases.keys())
conds = {v.T: 1500, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}


# Set higher DPI for the figure
plt.rcParams['figure.dpi'] = 300
start_time = time.time()
ax = ternplot(db_al_cu_y, comps, phases, conds, x=v.X('AL'), y=v.X('Y'), label_nodes=True)
end_time = time.time()
print(f"Elapsed time: {end_time - start_time:.3f} seconds")



plt.savefig('ternary_diagram_high_dpi.png', dpi=300)
plt.show()