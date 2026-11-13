import json
import pytest

from mvote.config import ConfigError, load_items


def test_load_json_items(tmp_path):
    p = tmp_path / "items.json"
    p.write_text(json.dumps([
        {"id": "v1", "label": "Sleep quality"},
        {"id": "v2", "label": "Mood", "description": "self-reported mood"},
    ]))
    items = load_items(p)
    assert len(items) == 2
    assert items[0].id == "v1"
    assert items[1].description == "self-reported mood"


def test_load_csv_items(tmp_path):
    p = tmp_path / "items.csv"
    p.write_text("id,label,description\nv1,Sleep quality,\nv2,Mood,self-reported mood\n")
    items = load_items(p)
    assert len(items) == 2
    assert items[1].label == "Mood"


def test_missing_required_field(tmp_path):
    p = tmp_path / "items.json"
    p.write_text(json.dumps([{"id": "v1"}]))
    with pytest.raises(ConfigError):
        load_items(p)


def test_duplicate_ids(tmp_path):
    p = tmp_path / "items.json"
    p.write_text(json.dumps([
        {"id": "v1", "label": "A"},
        {"id": "v1", "label": "B"},
    ]))
    with pytest.raises(ConfigError):
        load_items(p)


def test_empty_config(tmp_path):
    p = tmp_path / "items.json"
    p.write_text(json.dumps([]))
    with pytest.raises(ConfigError):
        load_items(p)


def test_unsupported_extension(tmp_path):
    p = tmp_path / "items.txt"
    p.write_text("not a config")
    with pytest.raises(ConfigError):
        load_items(p)


def test_missing_file(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_items(tmp_path / "does_not_exist.json")
