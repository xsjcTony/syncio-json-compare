<?php

namespace App\Services;


use Illuminate\Support\Facades\Storage;
use Swaggest\JsonDiff\Exception;
use Swaggest\JsonDiff\JsonDiff;

class JsonCompareService {

  private const string FIRST_PAYLOAD_FILE_NAME = 'json-compare-first.json';
  private const string SECOND_PAYLOAD_FILE_NAME = 'json-compare-second.json';


  public function storeFirstPayload(string $content): bool {
    return Storage::disk('local')->put(self::FIRST_PAYLOAD_FILE_NAME, $content);
  }

  public function storeSecondPayload(string $content): bool {
    return Storage::disk('local')->put(self::SECOND_PAYLOAD_FILE_NAME, $content);
  }


  public function isFirstPayloadExist(): bool {
    return Storage::disk('local')->exists(self::FIRST_PAYLOAD_FILE_NAME);
  }

  public function isSecondPayloadExist(): bool {
    return Storage::disk('local')->exists(self::SECOND_PAYLOAD_FILE_NAME);
  }

  public function isBothPayloadsExist(): bool {
    return $this->isFirstPayloadExist() && $this->isSecondPayloadExist();
  }


  public function compareJsons() {
    $json1 = $this->getFirstPayload();
    $json2 = $this->getSecondPayload();

    try {
      $result = new JsonDiff(json_decode($json1), json_decode($json2));

      return $result->getPatch()->jsonSerialize();
    } catch (Exception) {
      return false;
    }
  }


  private function getFirstPayload(): string {
    return Storage::disk('local')->get(self::FIRST_PAYLOAD_FILE_NAME);
  }

  private function getSecondPayload(): string {
    return Storage::disk('local')->get(self::SECOND_PAYLOAD_FILE_NAME);
  }
}
