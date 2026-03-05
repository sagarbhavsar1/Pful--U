"""
University data generation.
Simulates 250 US universities with realistic size, region, and type distributions.
"""

import numpy as np
import pandas as pd

# Top US university names (representative sample, padded with generated names)
_REAL_NAMES = [
    "University of Michigan", "Ohio State University", "Penn State University",
    "University of Florida", "University of Texas at Austin", "UCLA", "UC Berkeley",
    "University of Wisconsin-Madison", "University of Illinois Urbana-Champaign",
    "University of Georgia", "Indiana University Bloomington", "Michigan State University",
    "University of Alabama", "Arizona State University", "University of South Carolina",
    "University of Arizona", "Rutgers University", "University of Minnesota",
    "University of Maryland", "University of Colorado Boulder",
    "University of Virginia", "University of North Carolina at Chapel Hill",
    "University of Iowa", "University of Oregon", "University of Washington",
    "Purdue University", "Texas A&M University", "Virginia Tech",
    "University of Tennessee", "University of Kentucky",
    "USC", "NYU", "Boston University", "Northeastern University",
    "Georgetown University", "George Washington University",
    "Columbia University", "University of Chicago", "Stanford University",
    "MIT", "Harvard University", "Yale University", "Princeton University",
    "Duke University", "Northwestern University", "Vanderbilt University",
    "Emory University", "Rice University", "Tulane University",
    "Wake Forest University", "University of Notre Dame",
    "Brown University", "Dartmouth College", "Cornell University",
    "University of Pennsylvania", "Carnegie Mellon University",
    "Johns Hopkins University", "Tufts University", "Brandeis University",
    "American University", "Howard University", "Spelman College",
    "Morehouse College", "Florida State University", "University of Miami",
    "Clemson University", "Auburn University", "Mississippi State University",
    "University of Mississippi", "LSU", "University of Arkansas",
    "Oklahoma State University", "University of Oklahoma",
    "Kansas State University", "University of Kansas",
    "Iowa State University", "University of Nebraska-Lincoln",
    "Colorado State University", "University of Utah",
    "Brigham Young University", "Gonzaga University",
    "University of Portland", "Oregon State University",
    "Washington State University", "Boise State University",
    "San Diego State University", "UC San Diego", "UC Davis", "UC Santa Barbara",
    "UC Irvine", "Cal Poly SLO", "San Jose State University",
    "University of Hawaii", "University of Nevada Las Vegas",
    "University of New Mexico", "University of Houston",
    "SMU", "TCU", "Baylor University", "Texas Tech University",
]

_REGIONS = ["Northeast", "South", "Midwest", "West"]
_REGION_WEIGHTS = [0.25, 0.30, 0.22, 0.23]

_SETTINGS = ["Urban", "Suburban", "Rural"]
_SETTING_WEIGHTS = [0.45, 0.40, 0.15]

_TYPES = ["Public", "Private"]
_TYPE_WEIGHTS = [0.60, 0.40]


def _generate_name(idx: int) -> str:
    """Generate a university name for slots beyond the real names list."""
    suffixes = [
        "University", "State University", "College", "Institute of Technology",
        "Polytechnic University",
    ]
    prefixes = [
        "Northern", "Southern", "Eastern", "Western", "Central",
        "Greater", "Upper", "Lake", "River", "Valley",
        "Coastal", "Mountain", "Prairie", "Metro", "Atlantic",
        "Pacific", "Cascade", "Summit", "Ridge", "Harbor",
    ]
    states = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California",
        "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
        "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
        "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
        "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
        "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
        "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
        "Washington", "West Virginia", "Wisconsin", "Wyoming",
    ]
    rng = np.random.default_rng(seed=idx + 42)
    prefix = rng.choice(prefixes)
    state = rng.choice(states)
    suffix = rng.choice(suffixes)
    return f"{prefix} {state} {suffix}"


def generate_universities(n: int = 250, seed: int = 42) -> pd.DataFrame:
    """Generate n universities with realistic attribute distributions."""
    rng = np.random.default_rng(seed=seed)

    names = []
    for i in range(n):
        if i < len(_REAL_NAMES):
            names.append(_REAL_NAMES[i])
        else:
            names.append(_generate_name(i))

    # Student population: log-normal, median ~15k, range roughly 2k-60k
    raw_sizes = rng.lognormal(mean=np.log(15000), sigma=0.55, size=n)
    sizes = np.clip(raw_sizes, 2000, 65000).astype(int)

    regions = rng.choice(_REGIONS, size=n, p=_REGION_WEIGHTS)
    settings = rng.choice(_SETTINGS, size=n, p=_SETTING_WEIGHTS)
    types = rng.choice(_TYPES, size=n, p=_TYPE_WEIGHTS)

    # Adoption rate: beta distribution, mean ~12%
    # Private + Urban schools get a boost (Partiful skews this way)
    base_adoption = rng.beta(a=2.5, b=18, size=n)  # mean ~12%
    for i in range(n):
        if types[i] == "Private":
            base_adoption[i] *= 1.3
        if settings[i] == "Urban":
            base_adoption[i] *= 1.2
        if sizes[i] < 5000:
            base_adoption[i] *= 1.15  # small tight-knit schools
    adoption_rates = np.clip(base_adoption, 0.03, 0.35)

    df = pd.DataFrame({
        "university_id": [f"UNI_{i:04d}" for i in range(n)],
        "name": names,
        "student_population": sizes,
        "region": regions,
        "type": types,
        "setting": settings,
        "adoption_rate": np.round(adoption_rates, 4),
    })

    return df
