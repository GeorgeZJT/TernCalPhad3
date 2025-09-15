import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import time
import os
from pycalphad import Database, ternplot
from pycalphad import variables as v


def custom_legend(foo):
    """
    Build matplotlib handles for the plot legend.

    Parameters
    ----------
    phases : list
        Names of the phases.

    Returns
    -------
    A tuple containing:
    (1) A list of matplotlib handle objects
    (2) A dict mapping phase names to their RGB color on the plot

    Examples
    --------
    >>> legend_handles, colors = phase_legend(['FCC_A1', 'BCC_A2', 'LIQUID'])
    """
    phases = list(db_al_cu_y.phases.keys())
    colorlist = {}
    # colors from HU1SUN, August 5 2018, ordered by igorjrd, issue #97
    # exclude green and red because of their special meaning on the diagram
    colorvalues = [
        '00538A', 'F4C800', 'F13A13', 'C10020', 'D2F300', '53377A', '7BD1EC',
        '232C16', 'FE4262', 'C0DE00', '704AA4', 'FFB300', '176136', '7F180D',
        '93AA00', '2B85EB', 'F6768E', '007D34', '803E75', '4A7C01', 'FF8E00',
        'EC1840', '178D39', 'B32851', '577C23', 'A6BDD7', 'FD522B', '526B2E',
        '90324E', '593315', 'B6A0D4', 'FF6800', 'CEA262', '9A7CC4', '91250B',
        '7B3D0B', 'FF7A5C', 'C01F3D', 'D39336', '817066', '96541F', 'EB9867',
        'B15106', 'EE8548', '97691C', 'DF6B10', '987155', 'C76F32', 'B37347',
    ]
    mxx = len(colorvalues)
    phasecount = 0
    legend_handles = []
    for phase in phases:
        phase = phase.upper()
        colorlist[phase] = "#"+colorvalues[np.mod(phasecount, mxx)]
        legend_handles.append(mpatches.Patch(color=colorlist[phase], label=phase))
        phasecount = phasecount + 1
    return legend_handles, colorlist


db_al_cu_y = Database('Al_Cu_Y_assessment_files.TDB')
comps = ['AL', 'CU', 'Y', 'VA']
phases = list(db_al_cu_y.phases.keys())
output_dir = 'output_images_3'
os.makedirs(output_dir, exist_ok=True)

temperature_range = range(500, 1800, 10)

for temperature in temperature_range:
    conds = {v.T: temperature, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}

    fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))

    start_time = time.time()
    ax = ternplot(db_al_cu_y, comps, phases, conds, x=v.X('AL'), y=v.X('Y'), label_nodes = True, ax = ax, legend_generator = custom_legend)
    end_time = time.time()
    print(f"Elapsed time for T = {temperature}: {end_time - start_time:.3f} seconds")


    fig.patch.set_facecolor('black')
    ax.patch.set_facecolor('black')
    ax.set_title('')
    ax.get_legend().remove()
    ax.grid(False)

    if temperature == 500:
        ax.xaxis.label.set_text(f'X(AL)')
        ax.yaxis.label.set_text(f'X(Y)')
        ax.xaxis.label.set_color('white')
        ax.yaxis.label.set_color('white')
        ax.tick_params(axis='x', colors='white')
        ax.tick_params(axis='y', colors='white')
    elif temperature % 100 == 0:
        ax.xaxis.label.set_text(f'T = {temperature}K')
        ax.yaxis.label.set_text(f'T = {temperature}K')
        ax.xaxis.label.set_color('white')
        ax.yaxis.label.set_color('white')
        ax.tick_params(axis='x', colors='white')
        ax.tick_params(axis='y', colors='white')
    else:
        ax.axis('off')

    fig.set_size_inches(12, 12)

    plt.savefig(os.path.join(output_dir, f'T={temperature}.png'), dpi=300, transparent=True)
    # plt.savefig(f'T={temperature}.png', dpi = 300)
    # plt.show()
    plt.close(fig)




