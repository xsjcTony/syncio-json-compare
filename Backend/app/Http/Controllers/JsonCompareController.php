<?php

namespace App\Http\Controllers;


use App\Http\Requests\JsonCompareRequest;
use App\Services\JsonCompareService;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\Response;


class JsonCompareController extends Controller {

  private JsonCompareService $jsonCompareService;


  public function __construct(JsonCompareService $jsonCompareService) {
    $this->jsonCompareService = $jsonCompareService;
  }


  public function storePayload(JsonCompareRequest $request) {

    /**
     * First payload
     */
    // store if it's the first payload
    if ($request->payload_no === 1) {
      $firstPayloadStored = $this->jsonCompareService->storeFirstPayload($request->json_content);

      return $firstPayloadStored
        ? response()->json(['success' => true, 'message' => 'First payload stored successfully.'])
        : response()->json(
          ['message' => 'Failed to store the first payload.'],
          Response::HTTP_INTERNAL_SERVER_ERROR,
        );
    }


    /**
     * Second payload
     */
    // throw error if the first payload already exists
    if (!$this->jsonCompareService->isFirstPayloadExist()) {
      return response()->json(
        ['message' => 'Please upload the first payload first.'],
        Response::HTTP_BAD_REQUEST,
      );
    }


    // store the second payload
    $secondPayloadStored = $this->jsonCompareService->storeSecondPayload($request->json_content);

    return $secondPayloadStored
      ? response()->json(['success' => true, 'message' => 'Second payload stored successfully.'])
      : response()->json(
        ['message' => 'Failed to store the second payload.'],
        Response::HTTP_INTERNAL_SERVER_ERROR,
      );
  }


  public function comparePayloads() {
    if (!$this->jsonCompareService->isBothPayloadsExist()) {
      return response()->json(
        ['message' => 'Please upload payloads first.'],
        RESPONSE::HTTP_BAD_REQUEST,
      );
    } else {
      $result = $this->jsonCompareService->compareJsons();

      if ($result === false) {
        // diff failed
        return response()->json(
          ['message' => 'Failed to compare payloads.'],
          RESPONSE::HTTP_INTERNAL_SERVER_ERROR,
        );
      } else {
        return response()->json(['success' => true, 'diff' => $result]);
      }
    }
  }
}
