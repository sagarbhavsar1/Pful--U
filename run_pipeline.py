"""
Partiful U — Full Pipeline Runner
Generates synthetic data → runs SQL analytics → performs data science analysis → exports JSON.
One command: python run_pipeline.py
"""

import os
import sys
import time

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def main():
    total_start = time.time()

    print("\n" + "█" * 60)
    print("█  PARTIFUL U — Full Analytics Pipeline")
    print("█" * 60)

    # Step 1: Generate synthetic data
    print("\n\n" + "━" * 60)
    print("  PHASE 1: Synthetic Data Generation")
    print("━" * 60)
    from data.generate import main as generate_data
    generate_data()

    # Step 2: Run SQL analytics
    print("\n\n" + "━" * 60)
    print("  PHASE 2: SQL Analytics (DuckDB)")
    print("━" * 60)
    from analytics.queries import run_analytics
    run_analytics()

    # Step 3: Data science analysis
    print("\n\n" + "━" * 60)
    print("  PHASE 3: Data Science Analysis")
    print("━" * 60)

    project_root = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(project_root, "data", "output")
    analytics_dir = os.path.join(project_root, "analytics", "output")
    analysis_dir = os.path.join(project_root, "analysis", "output")
    os.makedirs(analysis_dir, exist_ok=True)

    print("\n[A] Clustering analysis...")
    from analysis.clustering import cluster_universities, cluster_users
    cluster_universities(
        os.path.join(analytics_dir, "university_performance.json"),
        analysis_dir,
    )
    cluster_users(data_dir, analysis_dir)

    print("\n[B] Cohort retention analysis...")
    from analysis.cohorts import compute_cohort_retention
    compute_cohort_retention(data_dir, analysis_dir)

    print("\n[C] Seasonality analysis...")
    from analysis.seasonality_analysis import analyze_seasonality
    analyze_seasonality(data_dir, analysis_dir)

    print("\n[D] Visibility impact analysis...")
    from analysis.visibility_impact import analyze_visibility_impact
    analyze_visibility_impact(data_dir, analysis_dir)

    print("\n[E] Generating insights...")
    from analysis.diagnostics import generate_insights
    generate_insights(analytics_dir, analysis_dir, analysis_dir)

    # Done
    elapsed = time.time() - total_start
    print("\n\n" + "█" * 60)
    print(f"█  Pipeline complete in {elapsed:.1f}s")
    print("█  Data:      data/output/")
    print("█  Analytics: analytics/output/")
    print("█  Analysis:  analysis/output/")
    print("█" * 60 + "\n")


if __name__ == "__main__":
    main()
