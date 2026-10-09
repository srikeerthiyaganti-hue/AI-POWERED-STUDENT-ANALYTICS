import json
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional

@dataclass
class QualityMetric:
    category: str
    total_records: int
    populated_records: int
    missing_records: int
    completeness_percentage: float

@dataclass
class DataQualityReport:
    dataset_name: str
    total_rows: int = 0
    valid_rows: int = 0
    duplicate_rows: int = 0
    missing_id_rows: int = 0
    anomalous_rows: int = 0
    category_metrics: Dict[str, QualityMetric] = field(default_factory=dict)
    validation_errors: List[Dict[str, Any]] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_name": self.dataset_name,
            "total_rows": self.total_rows,
            "valid_rows": self.valid_rows,
            "duplicate_rows": self.duplicate_rows,
            "missing_id_rows": self.missing_id_rows,
            "anomalous_rows": self.anomalous_rows,
            "category_metrics": {k: asdict(v) for k, v in self.category_metrics.items()},
            "validation_errors": self.validation_errors,
            "recommendations": self.recommendations
        }
